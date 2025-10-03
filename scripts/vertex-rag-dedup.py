#!/usr/bin/env python3
"""
Vertex AI RAG Corpus Duplicate Management Script
Helps identify and remove duplicate files from a RAG Corpus
"""

import os
import json
from google.cloud import aiplatform
from google.oauth2 import service_account
import argparse
from typing import List, Dict, Set
import hashlib

# Configuration
PROJECT_ID = "russtest4"
LOCATION = "europe-west4"
RAG_CORPUS_ID = "4611686018427387904"

def initialize_vertex_ai(credentials_path: str = None):
    """Initialize Vertex AI with credentials"""
    if credentials_path:
        credentials = service_account.Credentials.from_service_account_file(
            credentials_path,
            scopes=['https://www.googleapis.com/auth/cloud-platform']
        )
        aiplatform.init(
            project=PROJECT_ID,
            location=LOCATION,
            credentials=credentials
        )
    else:
        # Use default credentials
        aiplatform.init(
            project=PROJECT_ID,
            location=LOCATION
        )
    print(f"Initialized Vertex AI for project: {PROJECT_ID}, location: {LOCATION}")

def list_rag_files():
    """List all files in the RAG corpus"""
    try:
        # Build the API endpoint
        from google.cloud.aiplatform_v1beta1 import RagServiceClient
        from google.cloud.aiplatform_v1beta1.types import ListRagFilesRequest

        client = RagServiceClient()

        # Format: projects/{project}/locations/{location}/ragCorpora/{corpus}
        parent = f"projects/{PROJECT_ID}/locations/{LOCATION}/ragCorpora/{RAG_CORPUS_ID}"

        request = ListRagFilesRequest(parent=parent)

        # List all RAG files
        files = []
        page_result = client.list_rag_files(request=request)

        for response in page_result:
            file_info = {
                'name': response.name,
                'display_name': response.display_name,
                'size_bytes': response.size_bytes if hasattr(response, 'size_bytes') else 0,
                'create_time': response.create_time,
                'update_time': response.update_time,
            }
            files.append(file_info)

        print(f"Found {len(files)} files in RAG corpus")
        return files

    except Exception as e:
        print(f"Error listing RAG files: {e}")
        return []

def find_duplicates(files: List[Dict]) -> Dict[str, List[Dict]]:
    """Find duplicate files based on display name"""
    duplicates = {}
    name_map = {}

    for file in files:
        display_name = file.get('display_name', '')
        if display_name in name_map:
            if display_name not in duplicates:
                duplicates[display_name] = [name_map[display_name]]
            duplicates[display_name].append(file)
        else:
            name_map[display_name] = file

    return duplicates

def delete_rag_file(file_name: str):
    """Delete a specific file from the RAG corpus"""
    try:
        from google.cloud.aiplatform_v1beta1 import RagServiceClient
        from google.cloud.aiplatform_v1beta1.types import DeleteRagFileRequest

        client = RagServiceClient()

        request = DeleteRagFileRequest(name=file_name)

        # Delete the file
        operation = client.delete_rag_file(request=request)
        print(f"Deleting file: {file_name}")

        # Wait for operation to complete
        result = operation.result()
        print(f"Successfully deleted: {file_name}")
        return True

    except Exception as e:
        print(f"Error deleting file {file_name}: {e}")
        return False

def remove_duplicates(duplicates: Dict[str, List[Dict]], keep_newest: bool = True):
    """Remove duplicate files, keeping either the newest or oldest version"""
    total_deleted = 0

    for display_name, file_list in duplicates.items():
        print(f"\nFound {len(file_list)} versions of: {display_name}")

        # Sort by create_time
        sorted_files = sorted(file_list, key=lambda x: x.get('create_time', ''))

        # Keep either newest or oldest
        if keep_newest:
            files_to_delete = sorted_files[:-1]  # Delete all but the last (newest)
            kept_file = sorted_files[-1]
        else:
            files_to_delete = sorted_files[1:]   # Delete all but the first (oldest)
            kept_file = sorted_files[0]

        print(f"  Keeping: {kept_file['name']} (created: {kept_file.get('create_time', 'unknown')})")

        for file in files_to_delete:
            print(f"  Deleting: {file['name']} (created: {file.get('create_time', 'unknown')})")
            if delete_rag_file(file['name']):
                total_deleted += 1

    return total_deleted

def main():
    parser = argparse.ArgumentParser(description='Manage duplicates in Vertex AI RAG Corpus')
    parser.add_argument('--credentials', help='Path to service account JSON file')
    parser.add_argument('--list', action='store_true', help='List all files in RAG corpus')
    parser.add_argument('--find-duplicates', action='store_true', help='Find duplicate files')
    parser.add_argument('--remove-duplicates', action='store_true', help='Remove duplicate files')
    parser.add_argument('--keep-newest', action='store_true', default=True,
                       help='Keep newest version when removing duplicates (default)')
    parser.add_argument('--keep-oldest', action='store_true',
                       help='Keep oldest version when removing duplicates')

    args = parser.parse_args()

    # Initialize Vertex AI
    credentials_path = args.credentials or os.environ.get('GOOGLE_APPLICATION_CREDENTIALS')
    initialize_vertex_ai(credentials_path)

    if args.list or args.find_duplicates or args.remove_duplicates:
        # List all files
        files = list_rag_files()

        if args.list:
            print("\n=== All RAG Corpus Files ===")
            for file in files:
                print(f"- {file['display_name']} ({file['name']})")

        if args.find_duplicates or args.remove_duplicates:
            # Find duplicates
            duplicates = find_duplicates(files)

            if duplicates:
                print(f"\n=== Found {len(duplicates)} sets of duplicates ===")
                total_duplicate_files = sum(len(v) for v in duplicates.values())
                print(f"Total duplicate files: {total_duplicate_files}")
                print(f"Files that could be removed: {total_duplicate_files - len(duplicates)}")

                if args.remove_duplicates:
                    print("\n=== Removing Duplicates ===")
                    keep_newest = not args.keep_oldest
                    total_deleted = remove_duplicates(duplicates, keep_newest=keep_newest)
                    print(f"\nTotal files deleted: {total_deleted}")
                else:
                    print("\nRun with --remove-duplicates to delete these duplicates")
            else:
                print("\n✓ No duplicates found in RAG corpus")
    else:
        print("Please specify an action: --list, --find-duplicates, or --remove-duplicates")
        parser.print_help()

if __name__ == "__main__":
    main()
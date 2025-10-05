import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/config/weaviate.config';

export async function GET() {
  try {
    console.log('=== Inspecting Weaviate Schema ===');
    
    // Get all classes
    const schema = await client.schema.getter().do();

    const availableClasses = (schema.classes || []).map((cls: any) => cls.class);
    console.log('Available classes:', availableClasses);

    // Find the VC_PE_Voyage_Binary_Production class
    const targetClass = (schema.classes || []).find((cls: any) => cls.class === 'VC_PE_Voyage_Binary_Production');
    
    let result: any = {
      availableClasses,
      targetClassFound: !!targetClass
    };
    
    if (targetClass) {
      result.schema = {
        class: targetClass.class,
        description: targetClass.description || 'No description',
        vectorizer: targetClass.vectorizer || 'Not specified',
        properties: (targetClass.properties || []).map((prop: any) => ({
          name: prop.name,
          type: prop.dataType,
          description: prop.description || 'No description',
          tokenization: prop.tokenization
        }))
      };
      
      // Try to get a sample object to see actual field names
      try {
        const sample = await client.graphql
          .get()
          .withClassName('VC_PE_Voyage_Binary_Production')
          .withFields('content document_type company_name chunk_id document_id section_type chunk_index token_count')
          .withLimit(1)
          .do();
          
        if (sample.data.Get.VC_PE_Voyage_Binary_Production && sample.data.Get.VC_PE_Voyage_Binary_Production.length > 0) {
          const sampleObj = sample.data.Get.VC_PE_Voyage_Binary_Production[0];
          result.sampleData = {
            keys: Object.keys(sampleObj),
            structure: Object.entries(sampleObj).reduce((acc: any, [key, value]: [string, any]) => {
              acc[key] = {
                type: typeof value,
                hasValue: value !== null && value !== undefined,
                isArray: Array.isArray(value),
                preview: typeof value === 'string' && value.length > 100 
                  ? value.substring(0, 100) + '...' 
                  : value
              };
              return acc;
            }, {})
          };
        } else {
          result.sampleData = { message: 'No sample data found in collection' };
        }
      } catch (sampleError: any) {
        result.sampleError = sampleError.message;
      }
    }
    
    return NextResponse.json(result, { status: 200 });
    
  } catch (error: any) {
    console.error('Error inspecting schema:', error);
    return NextResponse.json(
      { error: 'Failed to inspect schema', details: error.message },
      { status: 500 }
    );
  }
}
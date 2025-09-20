'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, FileText, Search, Filter, Download, Eye, Calendar, Building2 } from 'lucide-react';

interface Document {
  id: string;
  title: string;
  type: string;
  company: string;
  uploadDate: string;
  fileSize: string;
  status: 'processed' | 'processing' | 'error';
  preview?: string;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCompany, setFilterCompany] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      
      // For now, we'll create mock documents based on the companies we have
      const companies = ['Advanced Navigation', 'Loopit', 'Riparide', 'Wonde', 'Circle In'];
      const documentTypes = ['Term Sheet', 'Subscription Agreement', 'Investor Update', 'Financial Report', 'Board Minutes'];
      
      const mockDocuments: Document[] = companies.flatMap((company, companyIndex) => 
        documentTypes.map((type, typeIndex) => ({
          id: `doc-${companyIndex}-${typeIndex}`,
          title: `${company} - ${type}`,
          type,
          company,
          uploadDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          fileSize: `${Math.floor(Math.random() * 5000) + 500} KB`,
          status: 'processed' as const,
          preview: `This is a sample ${type.toLowerCase()} document for ${company}. It contains important information about the investment terms, financial performance, and strategic direction.`
        }))
      );

      setDocuments(mockDocuments);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !filterType || doc.type === filterType;
    const matchesCompany = !filterCompany || doc.company === filterCompany;
    
    return matchesSearch && matchesType && matchesCompany;
  });

  const uniqueTypes = [...new Set(documents.map(doc => doc.type))];
  const uniqueCompanies = [...new Set(documents.map(doc => doc.company))];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fbf9f5' }}>
      {/* Header */}
      <div className="shadow-sm border-b" style={{ backgroundColor: '#ffffff', borderColor: '#e5e5e5' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </Link>
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <img
                src="/VeronaCapitalLogo.png"
                alt="Verona Capital"
                className="h-8"
              />
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Document Management
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Manage and organize your portfolio documents
          </p>
        </div>

        {/* Upload Section */}
        <div className="rounded-xl shadow-lg p-6 mb-8" style={{ backgroundColor: '#ffffff' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Upload Documents</h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Upload className="w-4 h-4" />
              Upload Files
            </button>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Upload new documents to your portfolio. Supported formats: PDF, DOC, DOCX, XLS, XLSX
          </p>
        </div>

        {/* Search and Filters */}
        <div className="rounded-xl shadow-lg p-6 mb-8" style={{ backgroundColor: '#ffffff' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Types</option>
              {uniqueTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            {/* Company Filter */}
            <select
              value={filterCompany}
              onChange={(e) => setFilterCompany(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Companies</option>
              {uniqueCompanies.map(company => (
                <option key={company} value={company}>{company}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Documents List */}
        <div className="rounded-xl shadow-lg" style={{ backgroundColor: '#ffffff' }}>
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Documents ({filteredDocuments.length})
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Loading documents...</span>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No documents found</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredDocuments.map((doc) => (
                <div key={doc.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="w-5 h-5 text-blue-500" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {doc.title}
                        </h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          doc.status === 'processed'
                            ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                            : doc.status === 'processing'
                            ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
                            : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                        }`}>
                          {doc.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                        <div className="flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          {doc.company}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(doc.uploadDate).toLocaleDateString()}
                        </div>
                        <span>{doc.fileSize}</span>
                      </div>

                      {doc.preview && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                          {doc.preview}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

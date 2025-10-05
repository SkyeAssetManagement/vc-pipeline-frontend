'use client';

import Link from 'next/link'
import { ArrowRight, ArrowLeft } from 'lucide-react'

export default function PortfolioPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fbf9f5' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <div className="flex justify-start mb-4">
              <Link
                href="/"
                className="inline-flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </div>
            <div className="flex justify-center">
              <Link href="/" className="hover:scale-105 transition-transform duration-200">
                <img
                  src="/VeronaCapitalLogo.png"
                  alt="Verona Capital"
                  className="h-20 mx-auto drop-shadow-lg"
                />
              </Link>
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-300 dark:to-gray-100 bg-clip-text text-transparent mb-4">
            Portfolio Overview
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Real-time portfolio analytics and performance metrics
          </p>
        </div>

        {/* Portfolio Overview Dashboard */}
        <div className="mb-12">
          <div className="rounded-xl shadow-lg border overflow-hidden bg-white dark:bg-gray-800" style={{ borderColor: '#e5e5e5' }}>
            <div className="relative h-[600px] md:h-[700px] lg:h-[800px] xl:h-[900px] rounded-xl overflow-hidden" style={{ backgroundColor: '#f8f8f8' }}>
              {/* Embedded Google Looker Studio Dashboard */}
              <iframe
                src="https://lookerstudio.google.com/embed/reporting/61dc78c9-5fdf-4f96-b80c-c8208f2edd7d/page/g23HF"
                width="100%"
                height="100%"
                style={{ border: 'none' }}
                title="Portfolio Overview Dashboard"
                className="rounded-xl"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              ></iframe>

              {/* Fallback overlay in case iframe doesn't load */}
              <div className="absolute top-4 right-4">
                <a
                  href="https://lookerstudio.google.com/reporting/61dc78c9-5fdf-4f96-b80c-c8208f2edd7d"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-lg border border-gray-200 dark:border-gray-600"
                >
                  <ArrowRight className="w-4 h-4 mr-1" />
                  Open Full View
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/companies"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500"
          >
            View Portfolio Companies
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500"
          >
            Access Full Dashboard
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
'use client';

import Link from 'next/link';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#fbf9f5' }}>
      <div className="max-w-md w-full space-y-8 p-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-block mb-6 hover:opacity-80 transition-opacity">
            <img
              src="/VeronaCapitalLogo.png"
              alt="Verona Capital"
              className="h-16 mx-auto"
            />
          </Link>
        </div>

        {/* Error Message */}
        <div className="rounded-xl shadow-lg p-8" style={{ backgroundColor: '#ffffff' }}>
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Authentication Error
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              There was an error signing you in. This could be due to:
            </p>
            <ul className="text-left text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-6">
              <li>• Invalid email or password</li>
              <li>• Account not found</li>
              <li>• Network connection issues</li>
              <li>• Server maintenance</li>
            </ul>
            <div className="space-y-3">
              <Link
                href="/auth/signin"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Try Again
              </Link>
              <div>
                <Link
                  href="/"
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

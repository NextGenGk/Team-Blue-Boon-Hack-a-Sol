import Link from 'next/link';
import { Heart, AlertCircle, ArrowLeft } from 'lucide-react';

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-xl shadow-sm border p-8">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Error</h1>
          <p className="text-gray-600 mb-6">
            There was an error processing your authentication. This could be due to an expired or invalid authentication code.
          </p>
          
          <div className="space-y-3">
            <Link 
              href="/sign-in"
              className="block w-full bg-health-primary hover:bg-green-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Try Signing In Again
            </Link>
            
            <Link 
              href="/"
              className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
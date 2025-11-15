'use client';

import { useState } from 'react';
import { useTranslation } from '@/lib/useTranslation';
import { UI_TRANSLATIONS } from '@/lib/lingoClient';

interface TranslationManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TranslationManager({ isOpen, onClose }: TranslationManagerProps) {
  const { currentLanguage, setLanguage } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredTranslations = Object.entries(UI_TRANSLATIONS).filter(([key, translation]) =>
    key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    translation.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
    translation.hi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Translation Manager</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Search translations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-health-primary"
            />
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  currentLanguage === 'en' 
                    ? 'bg-health-primary text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  currentLanguage === 'hi' 
                    ? 'bg-health-primary text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                हिंदी
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[60vh]">
          <div className="p-6">
            <div className="space-y-4">
              {filteredTranslations.map(([key, translation]) => (
                <div key={key} className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-600 mb-2">
                    Key: <code className="bg-gray-200 px-2 py-1 rounded text-xs">{key}</code>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        English
                      </label>
                      <div className="p-3 bg-white border border-gray-200 rounded-lg text-sm">
                        {translation.en}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        हिंदी (Hindi)
                      </label>
                      <div className="p-3 bg-white border border-gray-200 rounded-lg text-sm font-hindi">
                        {translation.hi}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {filteredTranslations.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No translations found matching your search.</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Total translations: {Object.keys(UI_TRANSLATIONS).length}
            </div>
            <button
              onClick={onClose}
              className="btn-primary"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
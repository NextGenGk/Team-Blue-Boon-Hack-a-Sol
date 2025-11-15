"use client";
import { useLanguage } from '@/components/LanguageProvider';

export function LanguageToggle() {
  const { currentLanguage, setLanguage } = useLanguage();

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
          currentLanguage === 'en'
            ? 'text-gray-700 bg-gray-100'
            : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage('hi')}
        className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
          currentLanguage === 'hi'
            ? 'text-gray-700 bg-gray-100'
            : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
        }`}
      >
        HI
      </button>
    </div>
  );
}
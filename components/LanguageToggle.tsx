'use client';

import { Globe } from 'lucide-react';
import { useLanguage } from './LanguageProvider';
import { SupportedLanguage } from '@/lib/lingoClient';

export function LanguageToggle() {
  const { currentLanguage, setLanguage } = useLanguage();

  const languages: { code: SupportedLanguage; name: string; nativeName: string }[] = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  ];

  return (
    <div className="language-toggle">
      <Globe className="w-4 h-4 text-gray-500" />
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLanguage(lang.code)}
          className={`language-option ${
            currentLanguage === lang.code ? 'active' : 'inactive'
          }`}
          aria-label={`Switch to ${lang.name}`}
        >
          {lang.nativeName}
        </button>
      ))}
    </div>
  );
}
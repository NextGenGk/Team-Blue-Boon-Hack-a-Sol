'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  SupportedLanguage, 
  getTranslation, 
  translateText,
  loadLanguagePreference,
  saveLanguagePreference,
  LanguageContextType 
} from '@/lib/lingoClient';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('en');

  useEffect(() => {
    // Load saved language preference or detect browser language
    const savedLanguage = loadLanguagePreference();
    setCurrentLanguage(savedLanguage);
  }, []);

  const setLanguage = (lang: SupportedLanguage) => {
    setCurrentLanguage(lang);
    saveLanguagePreference(lang);
    
    // Update document language attribute
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  };

  const t = (key: string, fallback?: string): string => {
    return getTranslation(key, currentLanguage, fallback);
  };

  const translateTextDynamic = async (text: string, targetLang: SupportedLanguage): Promise<string> => {
    return await translateText(text, targetLang, currentLanguage);
  };

  const value: LanguageContextType = {
    currentLanguage,
    setLanguage,
    t,
    translateText: translateTextDynamic,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
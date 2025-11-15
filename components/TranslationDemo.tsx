'use client';

import { useState } from 'react';
import { useTranslation } from '@/lib/useTranslation';
import { TranslationManager } from './TranslationManager';

export function TranslationDemo() {
  const { 
    t, 
    currentLanguage, 
    setLanguage, 
    translateCurrency, 
    translateDate, 
    translateTime,
    getLanguageClass 
  } = useTranslation();
  
  const [showManager, setShowManager] = useState(false);
  const [dynamicText, setDynamicText] = useState('');
  const [translatedText, setTranslatedText] = useState('');

  const handleDynamicTranslation = async () => {
    if (!dynamicText.trim()) return;
    
    try {
      // This would use the Lingo API for dynamic translation
      // For demo purposes, we'll show a placeholder
      setTranslatedText(`[Translated to ${currentLanguage}]: ${dynamicText}`);
    } catch (error) {
      console.error('Translation failed:', error);
    }
  };

  const currentDate = new Date();
  const sampleAmount = 1500;

  return (
    <div className={`p-6 bg-white rounded-lg shadow-lg ${getLanguageClass()}`}>
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-4">
          {t('demo.title', 'Translation System Demo')}
        </h3>
        
        <div className="flex items-center space-x-4 mb-6">
          <span className="text-sm font-medium text-gray-700">
            {t('demo.selectLanguage', 'Select Language:')}
          </span>
          <button
            onClick={() => setLanguage('en')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              currentLanguage === 'en' 
                ? 'bg-health-primary text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            English
          </button>
          <button
            onClick={() => setLanguage('hi')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              currentLanguage === 'hi' 
                ? 'bg-health-primary text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            हिंदी
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Static Translations */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-3">
            {t('demo.staticTranslations', 'Static UI Translations')}
          </h4>
          <div className="space-y-2 text-sm">
            <p><strong>{t('nav.home', 'Home')}:</strong> {t('nav.home')}</p>
            <p><strong>{t('search.placeholder', 'Search placeholder')}:</strong> {t('search.placeholder')}</p>
            <p><strong>{t('booking.confirmBooking', 'Confirm booking')}:</strong> {t('booking.confirmBooking')}</p>
            <p><strong>{t('auth.signIn', 'Sign in')}:</strong> {t('auth.signIn')}</p>
          </div>
        </div>

        {/* Formatted Content */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-3">
            {t('demo.formattedContent', 'Localized Formatting')}
          </h4>
          <div className="space-y-2 text-sm">
            <p><strong>{t('demo.currency', 'Currency')}:</strong> {translateCurrency(sampleAmount)}</p>
            <p><strong>{t('demo.date', 'Date')}:</strong> {translateDate(currentDate)}</p>
            <p><strong>{t('demo.time', 'Time')}:</strong> {translateTime(currentDate)}</p>
          </div>
        </div>

        {/* Dynamic Translation */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-3">
            {t('demo.dynamicTranslation', 'Dynamic Text Translation')}
          </h4>
          <div className="space-y-3">
            <input
              type="text"
              value={dynamicText}
              onChange={(e) => setDynamicText(e.target.value)}
              placeholder={t('demo.enterText', 'Enter text to translate...')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-health-primary"
            />
            <button
              onClick={handleDynamicTranslation}
              disabled={!dynamicText.trim()}
              className="btn-primary disabled:opacity-50"
            >
              {t('demo.translate', 'Translate')}
            </button>
            {translatedText && (
              <div className="p-3 bg-white border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">
                  {t('demo.result', 'Translation Result:')}
                </p>
                <p>{translatedText}</p>
              </div>
            )}
          </div>
        </div>

        {/* Translation Manager */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-3">
            {t('demo.management', 'Translation Management')}
          </h4>
          <button
            onClick={() => setShowManager(true)}
            className="btn-secondary"
          >
            {t('demo.viewAllTranslations', 'View All Translations')}
          </button>
        </div>
      </div>

      <TranslationManager 
        isOpen={showManager} 
        onClose={() => setShowManager(false)} 
      />
    </div>
  );
}
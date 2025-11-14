'use client';

import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useLanguage } from './LanguageProvider';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
}

export function SearchBar({ 
  onSearch, 
  isLoading = false, 
  placeholder,
  className = '' 
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="relative">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder || t('search.placeholder', 'Describe your symptoms or health concern...')}
          className="search-bar resize-none min-h-[60px] max-h-[120px] pr-12"
          rows={2}
          disabled={isLoading}
          aria-label={t('search.ariaLabel', 'Search for healthcare professionals')}
        />
        
        <button
          type="submit"
          disabled={!query.trim() || isLoading}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-health-primary hover:text-green-600 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
          aria-label={t('search.submit', 'Search')}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Search className="w-5 h-5" />
          )}
        </button>
      </div>
      
      {/* Search suggestions or recent searches could go here */}
      {query.length > 0 && !isLoading && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
          {/* Example suggestions - in a real app, these would be dynamic */}
          <div className="p-2">
            <div className="text-xs text-gray-500 px-2 py-1 font-medium">
              {t('search.suggestions', 'Suggestions')}
            </div>
            {[
              t('search.suggestion1', 'Fever and headache'),
              t('search.suggestion2', 'Stomach pain'),
              t('search.suggestion3', 'Skin rash'),
              t('search.suggestion4', 'Back pain'),
            ].filter(suggestion => 
              suggestion.toLowerCase().includes(query.toLowerCase())
            ).slice(0, 3).map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  setQuery(suggestion);
                  onSearch(suggestion);
                }}
                className="w-full text-left px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded"
              >
                <Search className="w-3 h-3 inline mr-2 text-gray-400" />
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </form>
  );
}
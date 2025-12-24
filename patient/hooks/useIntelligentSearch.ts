import { useState, useCallback } from 'react';
import { intelligentCaregiverSearch, IntelligentSearchResult } from '@/lib/intelligentCaregiverSearch';

interface UseIntelligentSearchOptions {
  maxResults?: number;
  autoSearch?: boolean;
}

interface UseIntelligentSearchReturn {
  searchByQuery: (query: string, userLocation?: { latitude: number; longitude: number }, language?: 'en' | 'hi') => Promise<void>;
  results: IntelligentSearchResult | null;
  isLoading: boolean;
  error: string | null;
  clearResults: () => void;
  searchSuggestions: string[];
}

export function useIntelligentSearch(options: UseIntelligentSearchOptions = {}): UseIntelligentSearchReturn {
  const { maxResults = 20 } = options;
  
  const [results, setResults] = useState<IntelligentSearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchByQuery = useCallback(async (
    query: string,
    userLocation?: { latitude: number; longitude: number },
    language: 'en' | 'hi' = 'en'
  ) => {
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Starting intelligent search for:', query);
      const searchResults = await intelligentCaregiverSearch.searchByQuery(
        query,
        userLocation,
        language,
        maxResults
      );
      
      console.log('Search completed:', searchResults);
      setResults(searchResults);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search caregivers';
      setError(errorMessage);
      console.error('Intelligent search error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [maxResults]);

  const clearResults = useCallback(() => {
    setResults(null);
    setError(null);
  }, []);

  const searchSuggestions = intelligentCaregiverSearch.getSearchSuggestions('en');

  return {
    searchByQuery,
    results,
    isLoading,
    error,
    clearResults,
    searchSuggestions
  };
}
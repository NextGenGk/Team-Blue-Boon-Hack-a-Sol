import { useState, useCallback } from 'react';
import { specializationMatcher, SpecializationSearchResult, SpecializationMatch } from '@/lib/specializationMatcher';

interface UseSpecializationSearchOptions {
  maxResults?: number;
}

interface UseSpecializationSearchReturn {
  searchByQuery: (query: string, userLocation?: { latitude: number; longitude: number }) => Promise<void>;
  searchBySpecializations: (specializations: string[], userLocation?: { latitude: number; longitude: number }) => Promise<void>;
  results: (SpecializationSearchResult & { specializationMatch?: SpecializationMatch }) | null;
  isLoading: boolean;
  error: string | null;
  clearResults: () => void;
  availableSpecializations: string[];
  specializationsByCategory: Record<string, string[]>;
}

export function useSpecializationSearch(options: UseSpecializationSearchOptions = {}): UseSpecializationSearchReturn {
  const { maxResults = 20 } = options;
  
  const [results, setResults] = useState<(SpecializationSearchResult & { specializationMatch?: SpecializationMatch }) | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchByQuery = useCallback(async (
    query: string,
    userLocation?: { latitude: number; longitude: number }
  ) => {
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Starting specialization search for:', query);
      const searchResults = await specializationMatcher.searchByQuery(
        query,
        userLocation,
        maxResults
      );
      
      console.log('Search completed:', searchResults);
      setResults(searchResults);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search caregivers';
      setError(errorMessage);
      console.error('Specialization search error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [maxResults]);

  const searchBySpecializations = useCallback(async (
    specializations: string[],
    userLocation?: { latitude: number; longitude: number }
  ) => {
    if (specializations.length === 0) {
      setError('Please select at least one specialization');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Starting search by specializations:', specializations);
      const searchResults = await specializationMatcher.searchBySpecializations(
        specializations,
        userLocation,
        maxResults
      );
      
      console.log('Specialization search completed:', searchResults);
      setResults(searchResults);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search caregivers';
      setError(errorMessage);
      console.error('Specialization search error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [maxResults]);

  const clearResults = useCallback(() => {
    setResults(null);
    setError(null);
  }, []);

  const availableSpecializations = specializationMatcher.getAvailableSpecializations();
  const specializationsByCategory = specializationMatcher.getSpecializationsByCategory();

  return {
    searchByQuery,
    searchBySpecializations,
    results,
    isLoading,
    error,
    clearResults,
    availableSpecializations,
    specializationsByCategory
  };
}
import { useState, useCallback } from 'react';
import { aiSymptomMatcher, AIAnalysisResponse, SymptomMatchResult } from '@/lib/aiSymptomMatcher';

interface UseAISymptomSearchOptions {
  maxDistance?: number;
  autoSearch?: boolean;
}

interface UseAISymptomSearchReturn {
  searchBySymptoms: (aiAnalysis: AIAnalysisResponse, userLocation?: { latitude: number; longitude: number }) => Promise<void>;
  results: SymptomMatchResult | null;
  isLoading: boolean;
  error: string | null;
  clearResults: () => void;
}

export function useAISymptomSearch(options: UseAISymptomSearchOptions = {}): UseAISymptomSearchReturn {
  const { maxDistance = 50 } = options;
  
  const [results, setResults] = useState<SymptomMatchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchBySymptoms = useCallback(async (
    aiAnalysis: AIAnalysisResponse,
    userLocation?: { latitude: number; longitude: number }
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const searchResults = await aiSymptomMatcher.findCaregiversBySymptoms(
        aiAnalysis,
        userLocation,
        maxDistance
      );
      
      setResults(searchResults);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search caregivers';
      setError(errorMessage);
      console.error('AI symptom search error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [maxDistance]);

  const clearResults = useCallback(() => {
    setResults(null);
    setError(null);
  }, []);

  return {
    searchBySymptoms,
    results,
    isLoading,
    error,
    clearResults
  };
}
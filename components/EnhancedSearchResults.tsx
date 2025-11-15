"use client";
import { useState, useMemo, useEffect } from 'react';
import { CaregiverCard } from '@/components/CaregiverCard';
import { useLanguage } from '@/components/LanguageProvider';
import { Loader2, Search, MapPin, Filter, Star } from 'lucide-react';
import { translateText, translateBatch, getTranslation } from '@/lib/lingoClient';
import type { SupportedLanguage } from '@/lib/lingoClient';

interface SearchResult {
  id: string;
  name: string;
  first_name: string;
  last_name: string;
  image_url: string | null;
  type: string;
  specializations: string[];
  bio: string;
  consultation_fee: number;
  home_visit_fee: number;
  available_for_home_visits: boolean;
  available_for_online: boolean;
  latitude: number;
  longitude: number;
  service_radius_km: number;
  is_verified: boolean;
  is_active: boolean;
  experience_years: number;
  languages: string[];
  qualifications: string[];
  rating: number;
  total_reviews: number;
  match_score: number;
  match_confidence: number;
  distance_km: number;
  short_reason: string;
  search_method: string;
  ai_recommendation: boolean;
  recommendation_rank: number;
}

interface EnhancedSearchResultsProps {
  results: SearchResult[];
  aiAnalysis: any;
  searchMetadata: any;
  query: string;
  isLoading: boolean;
}

export function EnhancedSearchResults({
  results,
  aiAnalysis,
  searchMetadata,
  query,
  isLoading,
}: EnhancedSearchResultsProps) {
  const { currentLanguage } = useLanguage();
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState<'match' | 'rating' | 'price'>('match');
  const [translatedResults, setTranslatedResults] = useState<SearchResult[]>(results);
  const [isTranslating, setIsTranslating] = useState(false);

  // Translate results when language changes
  useEffect(() => {
    const translateResults = async () => {
      if (currentLanguage === 'en') {
        setTranslatedResults(results);
        return;
      }

      setIsTranslating(true);
      try {
        const translatedData = await Promise.all(
          results.map(async (result) => {
            // Translate bio and specializations
            const [translatedBio, ...translatedSpecs] = await translateBatch([
              result.bio || '',
              ...result.specializations
            ], currentLanguage as SupportedLanguage, 'en');

            return {
              ...result,
              bio: translatedBio || result.bio,
              specializations: translatedSpecs.length > 0 ? translatedSpecs : result.specializations,
            };
          })
        );
        setTranslatedResults(translatedData);
      } catch (error) {
        console.error('Translation failed:', error);
        setTranslatedResults(results); // Fallback to original
      } finally {
        setIsTranslating(false);
      }
    };

    translateResults();
  }, [results, currentLanguage]);

  // Filter and sort results based on selected criteria
  const filteredAndSortedResults = useMemo(() => {
    let filtered = translatedResults.filter(result => result.rating >= minRating);
    
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'price':
          const priceA = a.consultation_fee || a.home_visit_fee || 0;
          const priceB = b.consultation_fee || b.home_visit_fee || 0;
          return priceA - priceB;
        case 'match':
        default:
          return b.match_score - a.match_score;
      }
    });
  }, [translatedResults, minRating, sortBy]);
  


  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-green-600" />
          <p className="text-gray-600">
            {getTranslation('search.searching', currentLanguage, 'Searching for healthcare providers...')}
          </p>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {getTranslation('search.noResults', currentLanguage, 'No Results Found')}
        </h3>
        <p className="text-gray-600 mb-4">
          {getTranslation('search.noResultsDesc', currentLanguage, 'We couldn\'t find any healthcare providers matching your search.')}
        </p>
        <p className="text-sm text-gray-500">
          {getTranslation('search.noResultsDesc', currentLanguage, 'Try adjusting your search terms or location.')}
        </p>
      </div>
    );
  }

  // Show message when filters result in no matches
  if (filteredAndSortedResults.length === 0) {
    return (
      <div className="space-y-6">
        {/* Filter Controls */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                0 Healthcare Providers
              </h3>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Rating Filter */}
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium text-gray-700">Min Rating:</span>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(Number(e.target.value))}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value={0}>All Ratings</option>
                  <option value={3}>3+ Stars</option>
                  <option value={4}>4+ Stars</option>
                  <option value={4.5}>4.5+ Stars</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'match' | 'rating' | 'price')}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="match">Best Match</option>
                  <option value="rating">Highest Rated</option>
                  <option value="price">Lowest Price</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center py-12">
          <Filter className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {currentLanguage === 'hi' ? 'कोई प्रदाता आपके फ़िल्टर से मेल नहीं खाता' : 'No Providers Match Your Filters'}
          </h3>
          <p className="text-gray-600 mb-4">
            {currentLanguage === 'hi' ? 'अपने रेटिंग फ़िल्टर या सॉर्टिंग विकल्पों को समायोजित करने का प्रयास करें।' : 'Try adjusting your rating filter or sorting options.'}
          </p>
          <button
            onClick={() => {
              setMinRating(0);
              setSortBy('match');
            }}
            className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-amber-700 transition-colors"
          >
            {currentLanguage === 'hi' ? 'फ़िल्टर साफ़ करें' : 'Clear Filters'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              {filteredAndSortedResults.length} {getTranslation('nav.caregivers', currentLanguage, 'Healthcare Providers')}
            </h3>
            {isTranslating && (
              <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Rating Filter */}
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700">
                {currentLanguage === 'hi' ? 'न्यूनतम रेटिंग:' : 'Min Rating:'}
              </span>
              <select
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value={0}>{currentLanguage === 'hi' ? 'सभी रेटिंग' : 'All Ratings'}</option>
                <option value={3}>{currentLanguage === 'hi' ? '3+ सितारे' : '3+ Stars'}</option>
                <option value={4}>{currentLanguage === 'hi' ? '4+ सितारे' : '4+ Stars'}</option>
                <option value={4.5}>{currentLanguage === 'hi' ? '4.5+ सितारे' : '4.5+ Stars'}</option>
              </select>
            </div>

            {/* Sort By */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">
                {currentLanguage === 'hi' ? 'इसके अनुसार क्रमबद्ध करें:' : 'Sort by:'}
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'match' | 'rating' | 'price')}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="match">{currentLanguage === 'hi' ? 'सर्वोत्तम मैच' : 'Best Match'}</option>
                <option value="rating">{currentLanguage === 'hi' ? 'उच्चतम रेटेड' : 'Highest Rated'}</option>
                <option value="price">{currentLanguage === 'hi' ? 'सबसे कम कीमत' : 'Lowest Price'}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredAndSortedResults.map((result, index) => (
            <div
              key={result.id}
              className="caregiver-card bg-white rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 animate-slide-up p-6"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Header with Avatar and Match Score */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {result.image_url ? (
                    <img 
                      src={result.image_url} 
                      alt={`${result.first_name || result.name} profile`}
                      className="w-12 h-12 rounded-full object-cover shadow-md"
                      onError={(e) => {
                        // Fallback to initials if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-md ${result.image_url ? 'hidden' : ''}`}>
                    {result.first_name?.[0] || result.name?.[0] || 'H'}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">
                      {result.first_name && result.last_name 
                        ? `${result.first_name} ${result.last_name}` 
                        : result.name || 'Healthcare Provider'}
                    </h4>
                    <p className="text-sm text-gray-600 capitalize">
                      {getTranslation(`caregiver.${result.type}`, currentLanguage, result.type)}
                    </p>
                    {result.experience_years > 0 && (
                      <p className="text-xs text-gray-500">
                        {result.experience_years} {currentLanguage === 'hi' ? 'साल का अनुभव' : 'years experience'}
                      </p>
                    )}
                  </div>
                </div>
                <div className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                  {Math.round(result.match_score)}% {currentLanguage === 'hi' ? 'मैच' : 'Match'}
                </div>
              </div>

              {/* Distance and Verification */}
              <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 text-amber-500 mr-1" />
                  <span>
                    {result.distance_km 
                      ? `${result.distance_km.toFixed(1)} ${currentLanguage === 'hi' ? 'किमी दूर' : 'km away'}` 
                      : currentLanguage === 'hi' ? 'ऑनलाइन उपलब्ध' : 'Available online'
                    }
                  </span>
                </div>
                {result.is_verified && (
                  <div className="flex items-center text-blue-600">
                    <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center mr-1">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-xs">{currentLanguage === 'hi' ? 'सत्यापित' : 'Verified'}</span>
                  </div>
                )}
              </div>

              {/* Specializations */}
              {result.specializations && result.specializations.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {result.specializations.slice(0, 3).map((spec, i) => (
                      <span 
                        key={i} 
                        className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-medium border border-blue-200"
                      >
                        {spec}
                      </span>
                    ))}
                    {result.specializations.length > 3 && (
                      <span className="text-xs text-gray-500 px-2 py-1">
                        +{result.specializations.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Bio/Description */}
              <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                {result.bio || result.short_reason || 'Experienced healthcare professional ready to help with your needs.'}
              </p>



              {/* Availability and Services */}
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <div className="flex items-center space-x-1 text-gray-600 mb-2">
                    <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">⚡</span>
                    </div>
                    <span className="font-medium">{currentLanguage === 'hi' ? 'सेवाएं' : 'Services'}</span>
                  </div>
                  <div className="space-y-1">
                    {result.available_for_online && (
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-gray-700">
                          {getTranslation('appointment.online', currentLanguage, 'Online consultation')}
                        </span>
                      </div>
                    )}
                    {result.available_for_home_visits && (
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-xs text-gray-700">
                          {getTranslation('appointment.homeVisit', currentLanguage, 'Home visits')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center space-x-1 text-gray-600 mb-2">
                    <span className="text-amber-600 font-bold">₹</span>
                    <span className="font-medium">{currentLanguage === 'hi' ? 'शुल्क' : 'Fees'}</span>
                  </div>
                  <div className="space-y-1">
                    {result.consultation_fee > 0 && (
                      <div className="text-xs text-gray-700">
                        {currentLanguage === 'hi' ? 'परामर्श' : 'Consultation'}: ₹{result.consultation_fee}
                      </div>
                    )}
                    {result.home_visit_fee > 0 && (
                      <div className="text-xs text-gray-700">
                        {currentLanguage === 'hi' ? 'घर पर विज़िट' : 'Home visit'}: ₹{result.home_visit_fee}
                      </div>
                    )}
                    {result.consultation_fee === 0 && result.home_visit_fee === 0 && (
                      <div className="text-xs text-green-600 font-medium">
                        {currentLanguage === 'hi' ? 'मूल्य के लिए संपर्क करें' : 'Contact for pricing'}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Languages */}
              {result.languages && result.languages.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center space-x-1 text-gray-600 mb-1">
                    <div className="w-4 h-4 bg-purple-400 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">🗣</span>
                    </div>
                    <span className="text-xs font-medium">{currentLanguage === 'hi' ? 'भाषाएं:' : 'Languages:'}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {result.languages.map((lang, i) => (
                      <span key={i} className="text-xs text-purple-700 bg-purple-50 px-2 py-1 rounded border border-purple-200">
                        {lang.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Rating */}
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <span 
                      key={i} 
                      className={`text-sm ${i < Math.floor(result.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {result.rating.toFixed(1)} ({result.total_reviews} reviews)
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end items-center pt-4 border-t border-gray-200">
                <button className="bg-amber-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-amber-700 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg">
                  {getTranslation('common.book', currentLanguage, 'Book Now')}
                </button>
              </div>
            </div>
        ))}
      </div>
    </div>
  );
}
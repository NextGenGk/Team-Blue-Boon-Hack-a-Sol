'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Stethoscope, Heart, Shield, Users, LogIn, UserPlus } from 'lucide-react';
import { SearchBar } from '@/components/SearchBar';
import { CaregiverCard } from '@/components/CaregiverCard';
import { LanguageToggle } from '@/components/LanguageToggle';
import { useLanguage } from '@/components/LanguageProvider';
import { useUser, UserButton } from '@clerk/nextjs';
import { Caregiver } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';

interface SearchResult extends Caregiver {
  match_score: number;
  distance_km: number;
  short_reason: string;
}

export default function HomePage() {
  const { user, isLoaded } = useUser();
  const { t, currentLanguage } = useLanguage();
  const router = useRouter();
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [useLocation, setUseLocation] = useState(false);

  // Request location permission
  const requestLocation = async () => {
    if (!navigator.geolocation) {
      toast.error(t('error.locationNotSupported', 'Location not supported'));
      return;
    }

    setUseLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        toast.success(t('success.locationEnabled', 'Location enabled'));
      },
      (error) => {
        console.error('Location error:', error);
        setUseLocation(false);
        toast.error(t('error.locationDenied', 'Location access denied'));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  };

  // Perform AI-powered search
  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    setIsSearching(true);
    setHasSearched(true);

    try {
      const searchParams = new URLSearchParams({
        query: query.trim(),
        lang: currentLanguage,
      });

      if (userLocation) {
        searchParams.append('lat', userLocation.lat.toString());
        searchParams.append('lon', userLocation.lon.toString());
      }

      const response = await fetch(`/api/search/caregivers?${searchParams}`);
      
      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      
      if (data.success) {
        setSearchResults(data.data || []);
      } else {
        throw new Error(data.error || 'Search failed');
      }

      if (data.data?.length === 0) {
        toast.error(t('search.noResults', 'No caregivers found for your search'));
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error(t('common.error', 'An error occurred'));
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container-mobile py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-health-primary rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">HealthPWA</h1>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageToggle />
              {!isLoaded ? (
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
              ) : user ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700 hidden sm:block">
                    {user.firstName || user.emailAddresses[0]?.emailAddress?.split('@')[0]}
                  </span>
                  <UserButton 
                    appearance={{
                      elements: {
                        avatarBox: "w-8 h-8",
                        userButtonPopoverCard: "bg-white shadow-lg border",
                        userButtonPopoverActionButton: "hover:bg-gray-50",
                      }
                    }}
                    afterSignOutUrl="/"
                  />
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => router.push('/sign-in')}
                    className="flex items-center space-x-1 text-sm text-health-primary hover:text-green-600"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </button>
                  <button 
                    onClick={() => router.push('/sign-up')}
                    className="flex items-center space-x-1 bg-health-primary text-white px-3 py-1.5 rounded-lg text-sm hover:bg-green-600"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Sign Up</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-8 md:py-12">
        <div className="container-mobile text-center">
          <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('hero.title', 'Find the Right Healthcare Professional')}
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            {t('hero.subtitle', 'Describe your symptoms and get AI-powered recommendations for doctors, nurses, and caregivers near you.')}
          </p>

          {/* Search Section */}
          <div className="max-w-2xl mx-auto mb-8">
            <SearchBar
              onSearch={handleSearch}
              isLoading={isSearching}
              placeholder={t('search.placeholder', 'Describe your symptoms or health concern...')}
            />
            
            {/* Location Toggle */}
            <div className="flex items-center justify-center mt-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useLocation}
                  onChange={(e) => {
                    if (e.target.checked) {
                      requestLocation();
                    } else {
                      setUseLocation(false);
                      setUserLocation(null);
                    }
                  }}
                  className="w-4 h-4 text-health-primary border-gray-300 rounded focus:ring-health-primary"
                />
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {t('search.useLocation', 'Use my location')}
                </span>
              </label>
            </div>
          </div>

          {/* Features Grid */}
          {!hasSearched && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Stethoscope className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('features.aiSearch', 'AI-Powered Search')}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t('features.aiSearchDesc', 'Get personalized caregiver recommendations based on your symptoms and location.')}
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('features.secure', 'Secure & Private')}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t('features.secureDesc', 'Your medical data is encrypted end-to-end and stored securely.')}
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('features.multilingual', 'Bilingual Support')}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t('features.multilingualDesc', 'Available in English and Hindi for better accessibility.')}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Search Results */}
      {hasSearched && (
        <section className="py-8">
          <div className="container-mobile">
            {isSearching ? (
              <div className="text-center py-12">
                <div className="spinner mx-auto mb-4"></div>
                <p className="text-gray-600">
                  {t('search.searching', 'Searching for caregivers...')}
                </p>
              </div>
            ) : (
              <>
                {searchResults.length > 0 ? (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {t('search.results', 'Search Results')} ({searchResults.length})
                      </h3>
                      <button
                        onClick={() => {
                          setHasSearched(false);
                          setSearchResults([]);
                        }}
                        className="text-health-primary hover:text-green-600 text-sm font-medium"
                      >
                        {t('search.newSearch', 'New Search')}
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {searchResults.map((caregiver) => (
                        <CaregiverCard
                          key={caregiver.id}
                          caregiver={caregiver}
                          matchScore={caregiver.match_score}
                          distance={caregiver.distance_km}
                          reason={caregiver.short_reason}
                          showBookButton={true}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {t('search.noResults', 'No caregivers found')}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {t('search.noResultsDesc', 'Try adjusting your search terms or enable location for better results.')}
                    </p>
                    <button
                      onClick={() => {
                        setHasSearched(false);
                        setSearchResults([]);
                      }}
                      className="btn-primary"
                    >
                      {t('search.tryAgain', 'Try Again')}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      )}

      {/* Medical Disclaimer */}
      <section className="py-8 bg-yellow-50 border-t">
        <div className="container-mobile">
          <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-yellow-800 mb-1">
                  {t('disclaimer.title', 'Medical Disclaimer')}
                </h4>
                <p className="text-sm text-yellow-700">
                  {t('disclaimer.aiAdvice', 'This AI-generated advice is for informational purposes only and should not replace professional medical consultation.')}
                </p>
                <p className="text-sm text-yellow-700 mt-2">
                  {t('disclaimer.emergency', 'In case of emergency, please call 102 or visit the nearest hospital immediately.')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
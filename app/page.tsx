"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Stethoscope,
  Shield,
  Users,
  LogIn,
  UserPlus,
  Mic,
  MicOff,
  Globe,
} from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { EnhancedSearchResults } from "@/components/EnhancedSearchResults";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useTranslation } from "@/lib/useTranslation";
import { useEnhancedSupabase } from "@/components/EnhancedSupabaseProvider";
import toast from "react-hot-toast";

interface SearchResult {
  id: string;
  name: string;
  first_name: string;
  last_name: string;
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
  profile_image_url: string | null;
  center_id: string | null;
  match_score: number;
  short_reason: string;
  ai_powered: boolean;
  match_confidence?: number;
  distance_km?: number;
  search_method?: string;
  ai_recommendation?: boolean;
  recommendation_rank?: number;
}

// Custom Location Icon Component
const LocationIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" fill="url(#locationGrad)"/>
    <path d="M12 12C13.1046 12 14 11.1046 14 10C14 8.89543 13.1046 8 12 8C10.8954 8 10 8.89543 10 10C10 11.1046 10.8954 12 12 12Z" fill="white"/>
    <defs>
      <linearGradient id="locationGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{stopColor: '#3b82f6', stopOpacity: 1}} />
        <stop offset="100%" style={{stopColor: '#1d4ed8', stopOpacity: 1}} />
      </linearGradient>
    </defs>
  </svg>
);

// Enhanced SearchBar with integrated mic button
const EnhancedSearchBar = ({ onSearch, isLoading, placeholder, className, value, onChange }: {
  onSearch: (query: string) => void;
  isLoading: boolean;
  placeholder: string;
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
}) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize speech recognition
    const initSpeechRecognition = () => {
      if (typeof window === 'undefined') return null;

      const SpeechRecognition = window.SpeechRecognition ||
                               window.webkitSpeechRecognition ||
                               (window as any).mozSpeechRecognition ||
                               (window as any).msSpeechRecognition;

      if (!SpeechRecognition) {
        console.warn('Speech recognition not supported in this browser');
        return null;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        toast.success('Listening... Speak now');
        console.log('Speech recognition started');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log('Voice input received:', transcript);
        if (onChange) {
          onChange(transcript);
        }
        toast.success("Voice input captured!");
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        switch (event.error) {
          case 'not-allowed':
          case 'permission-denied':
            toast.error('Microphone permission denied. Please allow microphone access in your browser settings.');
            break;
          case 'audio-capture':
            toast.error('No microphone found. Please check your microphone connection.');
            break;
          case 'network':
            toast.error('Network error occurred during voice recognition.');
            break;
          default:
            toast.error('Voice recognition failed. Please try again.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        console.log('Speech recognition ended');
      };

      return recognition;
    };

    recognitionRef.current = initSpeechRecognition();

    // Cleanup on unmount
    return () => {
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
    };
  }, [onChange, isListening]);

  const checkMicrophonePermission = async () => {
    try {
      const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      return permissionStatus.state === 'granted';
    } catch (error) {
      console.error('Error checking microphone permission:', error);
      return false;
    }
  };

  const startVoiceRecognition = async () => {
    if (!recognitionRef.current) {
      toast.error('Voice search is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    const hasPermission = await checkMicrophonePermission();
    if (!hasPermission) {
      toast.error('Microphone permission required. Please allow microphone access.');
      return;
    }

    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      toast.error('Failed to start voice recognition. Please try again.');
    }
  };

  const stopVoiceRecognition = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const toggleVoice = () => {
    if (isListening) {
      stopVoiceRecognition();
    } else {
      startVoiceRecognition();
    }
  };

  return (
    <div className="relative w-full">
      <div className="flex items-center gap-2 w-full">
        <div className="flex-1 relative">
          <SearchBar 
            onSearch={onSearch}
            isLoading={isLoading}
            placeholder={placeholder}
            className={`${className} pr-16`}
            value={value}
            onChange={onChange}
          />
          <button
            onClick={toggleVoice}
            disabled={isLoading}
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-xl transition-all duration-300 flex items-center justify-center ${
              isListening
                ? 'bg-red-500 text-white animate-pulse voice-pulse'
                : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:shadow-lg'
            } disabled:opacity-50 disabled:cursor-not-allowed border-2 border-white shadow-lg`}
            title="Voice Search"
            aria-label={isListening ? "Stop voice search" : "Start voice search"}
            type="button"
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
        </div>
      </div>
      {isListening && (
        <div className="absolute -bottom-8 left-0 flex items-center space-x-2 text-red-500 text-sm font-semibold animate-pulse">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
          <span>Listening... Speak now</span>
        </div>
      )}
    </div>
  );
};

// Location Modal Component
const LocationModal = ({ 
  isOpen, 
  onClose, 
  onEnable 
}: {
  isOpen: boolean;
  onClose: () => void;
  onEnable: () => void;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 transform animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full flex items-center justify-center mx-auto mb-5 shadow-xl">
            <LocationIcon />
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-3">Enable Location Access</h3>
          <p className="text-gray-600 leading-relaxed">
            Allow us to access your location to find healthcare professionals nearest to you
          </p>
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all duration-200"
            aria-label="Not now"
          >
            Not Now
          </button>
          <button
            onClick={onEnable}
            className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-bold hover:shadow-xl hover:shadow-blue-200 transform hover:scale-105 transition-all duration-300"
            aria-label="Enable location"
          >
            Enable Location
          </button>
        </div>
      </div>
    </div>
  );
};

// Animated Banner Component
const AnimatedBanner = () => {
  const bannerText = "Medical Disclaimer: This AI-generated advice is for informational purposes only and should not replace professional medical consultation. In case of emergency, please call 102 or visit the nearest hospital immediately.";
  
  return (
    <div className="bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-200 py-3 overflow-hidden relative">
      <div className="animate-marquee whitespace-nowrap">
        <span className="text-red-700 font-semibold text-sm mx-8">⚠️ {bannerText}</span>
      </div>
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
          display: inline-block;
          padding-right: 50%;
        }
      `}</style>
    </div>
  );
};

export default function HomePage() {
  const { user, loading } = useEnhancedSupabase();
  const {
    t,
    currentLanguage,
    getErrorMessage,
    getSuccessMessage,
    getLanguageClass,
  } = useTranslation();
  const router = useRouter();
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [searchMetadata, setSearchMetadata] = useState<any>(null);
  const [currentQuery, setCurrentQuery] = useState("");
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [useLocation, setUseLocation] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  // Request location permission
  const requestLocation = async () => {
    if (!navigator.geolocation) {
      toast.error(
        getErrorMessage("locationNotSupported", "Location not supported")
      );
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        setUseLocation(true);
        setShowLocationModal(false);
        toast.success(getSuccessMessage("locationEnabled", "Location enabled"));
      },
      (error) => {
        console.error("Location error:", error);
        setUseLocation(false);
        setShowLocationModal(false);
        toast.error(
          getErrorMessage("locationDenied", "Location access denied")
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  };

  // Perform AI-powered search
  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    setIsSearching(true);
    setHasSearched(true);
    setCurrentQuery(query.trim());
    try {
      const searchParams = new URLSearchParams({
        query: query.trim(),
        lang: currentLanguage,
      });
      if (userLocation) {
        searchParams.append("lat", userLocation.lat.toString());
        searchParams.append("lon", userLocation.lon.toString());
      }
      const response = await fetch(`/api/ai-search-simple?${searchParams}`);
      if (!response.ok) {
        throw new Error("Search failed");
      }
      const data = await response.json();
      if (data.success && data.results) {
        const transformedResults = data.results.map((result: any, index: number) => ({
          ...result,
          match_confidence: 0.8,
          distance_km: 0,
          search_method: result.ai_powered ? 'ai_analysis' : 'keyword_match',
          ai_recommendation: result.match_score >= 70,
          recommendation_rank: index + 1,
        })) as SearchResult[];
        
        setSearchResults(transformedResults);
        setAiAnalysis(data.ai_analysis || null);
        setSearchMetadata({
          total_results: data.results.length,
          search_time_ms: 100,
          user_location: userLocation ? { lat: userLocation.lat, lon: userLocation.lon } : null,
          specializations_searched: data.specializations_searched || [],
          ai_model_used: data.ai_model_used,
        });
        
        if (data.results.length === 0) {
          toast.error(
            t("search.noResults", "No caregivers found for your search")
          );
        } else {
          toast.success(
            t(
              "search.foundResults",
              `Found ${data.results.length} matching caregivers using ${data.ai_model_used}`
            )
          );
        }
      } else {
        throw new Error(data.error || "Search failed");
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error(t("common.error", "An error occurred"));
      setSearchResults([]);
      setAiAnalysis(null);
      setSearchMetadata(null);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle location toggle
  const handleLocationToggle = () => {
    if (useLocation) {
      setUseLocation(false);
      setUserLocation(null);
      toast.success("Location disabled");
    } else {
      setShowLocationModal(true);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Main Content */}
      <div
        className={`flex-1 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 ${getLanguageClass()} safe-area-inset-top safe-area-inset-bottom pb-16`}
      >
        {/* Animated Medical Disclaimer Banner */}
        <AnimatedBanner />

        {/* Enhanced Header */}
        <header className="bg-white/90 backdrop-blur-md shadow-lg border-b border-gray-200/60 sticky top-0 z-40">
          <div className="container-mobile py-3">
            <div className="flex items-center justify-between">
              {/* Left Section - Logo */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3 cursor-pointer group">
                  <div className="transform transition-all duration-500 group-hover:scale-110">
                    <h1 className="text-2xl font-black text-green-600 select-none">
                      AyurSutra
                    </h1>
                  </div>
                </div>

                {/* About Us Button */}
                <button
                  onClick={() => router.push("/about")}
                  className="hidden md:flex items-center space-x-2 px-4 py-2.5 text-sm font-bold text-gray-700 hover:text-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  aria-label="About Us"
                >
                  <Globe className="w-5 h-5" />
                  <span>About Us</span>
                </button>
              </div>

              {/* Right Section - Location, Auth & Language */}
              <div className="flex items-center space-x-3">
                {/* Location Button */}
                <button
                  onClick={handleLocationToggle}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105 shadow-md focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                    useLocation 
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-blue-200' 
                      : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-400'
                  }`}
                  aria-label={useLocation ? "Disable location" : "Enable location"}
                >
                  <div className="w-5 h-5">
                    <LocationIcon />
                  </div>
                  <span className="hidden sm:inline">
                    {useLocation ? t("location.active", "Location On") : t("location.inactive", "Location")}
                  </span>
                </button>

                <LanguageToggle />
                
                {loading ? (
                  <div className="w-10 h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full animate-pulse"></div>
                ) : user ? (
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-bold text-gray-700 hidden sm:block truncate max-w-[120px] bg-white/80 px-3 py-1.5 rounded-lg border border-gray-200">
                      {user.user_metadata?.first_name ||
                        user.email?.split("@")[0]}
                    </span>
                    <div className="relative">
                      <button
                        onClick={() => router.push("/profile")}
                        className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 text-white rounded-full flex items-center justify-center text-base font-bold hover:shadow-lg hover:shadow-blue-200 transform hover:scale-110 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                        aria-label={t("profile.view", "View Profile")}
                      >
                        {user.user_metadata?.first_name?.[0]?.toUpperCase() ||
                          user.email?.[0]?.toUpperCase() || 'U'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => router.push("/sign-in")}
                      className="flex items-center space-x-2 text-sm font-bold text-blue-600 hover:text-blue-700 px-4 py-2.5 rounded-xl hover:bg-blue-50 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      aria-label={t("auth.signIn", "Sign In")}
                    >
                      <LogIn className="w-5 h-5" />
                      <span>{t("auth.signIn", "Sign In")}</span>
                    </button>
                    <button
                      onClick={() => router.push("/sign-up")}
                      className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:shadow-xl hover:shadow-blue-200 transform hover:scale-105 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue-500"
                      aria-label={t("auth.signUp", "Sign Up")}
                    >
                      <UserPlus className="w-5 h-5" />
                      <span>{t("auth.signUp", "Sign Up")}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-16 md:py-20">
          <div className="container-mobile text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-5 py-2.5 rounded-full text-sm font-bold mb-8 shadow-sm animate-fade-in border border-blue-200">
              <span className="text-base">🎯</span>
              <span>AI-Powered Healthcare Platform</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight leading-tight animate-fade-in">
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {t("hero.title", "Find the Right Healthcare Professional")}
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed font-medium animate-slide-up">
              {t(
                "hero.subtitle",
                "Describe your symptoms and get AI-powered recommendations for doctors, nurses, and caregivers near you."
              )}
            </p>

            {/* Enhanced Search Section with Integrated Mic */}
            <div className="max-w-4xl mx-auto mb-16">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-2xl blur-xl opacity-20 animate-pulse"></div>
                <EnhancedSearchBar
                  onSearch={handleSearch}
                  isLoading={isSearching}
                  placeholder={t(
                    "search.placeholder",
                    "Describe your symptoms or health concern..."
                  )}
                  className="search-bar shadow-2xl border-2 border-gray-200 focus-within:border-blue-500 transition-all duration-300 rounded-2xl bg-white/80 backdrop-blur-sm text-lg"
                  value={currentQuery}
                  onChange={setCurrentQuery}
                />
              </div>

              {/* Search Tips */}
              {!hasSearched && (
                <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-gray-500">
                  <span className="bg-white/80 px-3 py-1.5 rounded-full border border-gray-200">
                    💬 "I have a headache and fever"
                  </span>
                  <span className="bg-white/80 px-3 py-1.5 rounded-full border border-gray-200">
                    🎤 Click mic for voice input
                  </span>
                  <span className="bg-white/80 px-3 py-1.5 rounded-full border border-gray-200">
                    📍 Enable location for nearby results
                  </span>
                </div>
              )}
            </div>

            {/* Features Grid */}
            {!hasSearched && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-20">
                {[
                  {
                    icon: <Stethoscope className="w-8 h-8" />,
                    title: t("features.aiSearch", "AI-Powered Search"),
                    desc: t(
                      "features.aiSearchDesc",
                      "Get personalized caregiver recommendations based on your symptoms and location."
                    ),
                    gradient: "from-blue-500 to-cyan-500",
                    bg: "from-blue-50 to-cyan-50",
                    border: "border-blue-200",
                  },
                  {
                    icon: <Shield className="w-8 h-8" />,
                    title: t("features.secure", "Secure & Private"),
                    desc: t(
                      "features.secureDesc",
                      "Your medical data is encrypted end-to-end and stored securely."
                    ),
                    gradient: "from-indigo-500 to-purple-500",
                    bg: "from-indigo-50 to-purple-50",
                    border: "border-indigo-200",
                  },
                  {
                    icon: <Users className="w-8 h-8" />,
                    title: t("features.multilingual", "Bilingual Support"),
                    desc: t(
                      "features.multilingualDesc",
                      "Available in English and Hindi for better accessibility."
                    ),
                    gradient: "from-purple-500 to-pink-500",
                    bg: "from-purple-50 to-pink-50",
                    border: "border-purple-200",
                  },
                ].map((feature, index) => (
                  <div
                    key={index}
                    className={`bg-gradient-to-br ${feature.bg} p-8 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-3 transition-all duration-500 animate-slide-up cursor-pointer border ${feature.border} group`}
                    style={{ animationDelay: `${index * 100}ms` }}
                    onClick={() => {
                      if (index === 0) {
                        setCurrentQuery("fever and cough");
                      }
                    }}
                  >
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 mx-auto text-white shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Enhanced Search Results */}
        {hasSearched && (
          <section className="py-12 bg-white/60 backdrop-blur-sm min-h-screen">
            <div className="container-mobile">
              <div className="mb-8 text-center">
                <h2 className="text-3xl font-black text-gray-900 mb-2">
                  Search Results for "{currentQuery}"
                </h2>
                {searchMetadata && (
                  <p className="text-gray-600">
                    Found {searchResults.length} caregivers using {searchMetadata.ai_model_used}
                    {useLocation && " • Location-based results"}
                  </p>
                )}
              </div>

              <EnhancedSearchResults
                results={searchResults}
                aiAnalysis={aiAnalysis}
                searchMetadata={searchMetadata}
                query={currentQuery}
                isLoading={isSearching}
              />

              {!isSearching && (searchResults.length > 0 || hasSearched) && (
                <div className="text-center mt-12">
                  <button
                    onClick={() => {
                      setHasSearched(false);
                      setSearchResults([]);
                      setAiAnalysis(null);
                      setSearchMetadata(null);
                      setCurrentQuery("");
                    }}
                    className="px-8 py-3.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-blue-200 transform hover:scale-105 transition-all duration-300 shadow-lg focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue-500"
                    aria-label="Start new search"
                  >
                    {t("search.newSearch", "Start New Search")}
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Location Modal */}
        <LocationModal
          isOpen={showLocationModal}
          onClose={() => setShowLocationModal(false)}
          onEnable={requestLocation}
        />
      </div>

      {/* Footer */}
      <footer className="bg-white/90 backdrop-blur-md border-t border-gray-200 py-4 text-center">
        <div className="container-mobile">
          <p className="text-sm text-gray-600 font-medium">
            Copyright AyurSutra Team BlueBune &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
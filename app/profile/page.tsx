"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useEnhancedSupabase } from "@/components/EnhancedSupabaseProvider";
import { createClient } from "@/lib/supabase";
import {
  Heart,
  User,
  Mail,
  Phone,
  LogOut,
  ArrowLeft,
  Calendar,
  FileText,
  DollarSign,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Pill,
  CreditCard,
  Stethoscope,
  ClipboardList,
  BarChart3,
  Receipt,
  Eye,
  Plus,
  Filter,
  MapPin,
  Shield,
  Edit,
  Globe,
  UserPlus,
  LogIn,
} from "lucide-react";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useTranslation } from "@/lib/useTranslation";
import toast from "react-hot-toast";

// Custom Location Icon Component
const LocationIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z"
      fill="url(#locationGrad)"
    />
    <path
      d="M12 12C13.1046 12 14 11.1046 14 10C14 8.89543 13.1046 8 12 8C10.8954 8 10 8.89543 10 10C10 11.1046 10.8954 12 12 12Z"
      fill="white"
    />
    <defs>
      <linearGradient id="locationGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: "#3b82f6", stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: "#1d4ed8", stopOpacity: 1 }} />
      </linearGradient>
    </defs>
  </svg>
);

// Animated Banner Component
const AnimatedBanner = () => {
  const bannerText =
    "Medical Disclaimer: This AI-generated advice is for informational purposes only and should not replace professional medical consultation. In case of emergency, please call 102 or visit the nearest hospital immediately.";

  return (
    <div className="bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-200 py-3 overflow-hidden relative">
      <div className="animate-marquee whitespace-nowrap">
        <span className="text-red-700 font-semibold text-sm mx-8">
          ⚠️ {bannerText}
        </span>
      </div>
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
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

export default function ProfilePage() {
  const { user, loading } = useEnhancedSupabase();
  const {
    t,
    currentLanguage,
    getErrorMessage,
    getSuccessMessage,
    getLanguageClass,
  } = useTranslation();
  const router = useRouter();
  const [profileData, setProfileData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "appointments" | "prescriptions" | "progress" | "finance"
  >("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [useLocation, setUseLocation] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/sign-in");
      return;
    }

    // Fetch real user data
    fetchUserProfile();
  }, [user, loading, router]);

  const fetchUserProfile = async () => {
    setFetchingData(true);
    setError(null);

    try {
      if (!user?.email) {
        throw new Error("No authenticated user found");
      }

      // First try to get profile
      let response = await fetch("/api/profile/simple", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      let result = await response.json();

      // If user doesn't exist in database, create them
      if (!result.success && result.error === 'Authentication required') {
        console.log("User not found in database, creating...");
        
        const createResponse = await fetch("/api/create-user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        const createResult = await createResponse.json();
        
        if (createResult.success) {
          toast.success("User profile created successfully");
          
          // Try to fetch profile again
          response = await fetch("/api/profile/simple", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          });
          
          result = await response.json();
        } else {
          throw new Error(createResult.error || "Failed to create user profile");
        }
      }

      if (result.success) {
        setProfileData(result.data);
        toast.success("Profile loaded successfully");
      } else {
        throw new Error(result.error || "Failed to load profile");
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError(err instanceof Error ? err.message : "Failed to load profile");
      toast.error("Failed to load profile data");
    } finally {
      setFetchingData(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Signed out successfully");
      router.push("/");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

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
        toast.success(getSuccessMessage("locationEnabled", "Location enabled"));
      },
      (error) => {
        console.error("Location error:", error);
        setUseLocation(false);
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

  // Handle location toggle
  const handleLocationToggle = () => {
    if (useLocation) {
      setUseLocation(false);
      setUserLocation(null);
      toast.success("Location disabled");
    } else {
      requestLocation();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "paid":
        return "text-green-600 bg-green-100";
      case "confirmed":
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "cancelled":
      case "failed":
        return "text-red-600 bg-red-100";
      case "in_progress":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const formatCurrency = (amount: number, currency: string = "INR") => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const stats = profileData?.stats || {
    totalAppointments: 0,
    completedAppointments: 0,
    totalSpent: 0,
    activePrescriptions: 0,
    progressCompletion: 0,
  };

  if (loading || fetchingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600">
            {loading ? "Loading..." : "Fetching profile data..."}
          </p>
        </div>
      </div>
    );
  }

  if (!user || !profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Profile Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            {error || "Unable to load profile data"}
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-green-50 to-blue-50 ${getLanguageClass()}`}
    >
      {/* Animated Medical Disclaimer Banner */}
      <AnimatedBanner />

      {/* Enhanced Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-lg border-b border-gray-200/60 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left Section - Logo */}
            <div className="flex items-center space-x-4 min-w-0 flex-1">
              <div
                className="flex items-center space-x-3 cursor-pointer group min-w-[140px]"
                onClick={() => router.push("/")}
              >
                <div className="transform transition-all duration-500 group-hover:scale-110">
                  <h1 className="text-2xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent whitespace-nowrap">
                    AyurSutra
                  </h1>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="hidden md:flex items-center space-x-1">
                <button
                  onClick={() => router.push("/")}
                  className="flex items-center space-x-2 px-4 py-2.5 text-sm font-bold text-gray-700 hover:text-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-200"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Home</span>
                </button>
                <button
                  onClick={() => router.push("/appointments")}
                  className="flex items-center space-x-2 px-4 py-2.5 text-sm font-bold text-gray-700 hover:text-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-200"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Appointments</span>
                </button>
              </div>
            </div>

            {/* Right Section - Location, Auth & Language */}
            <div className="flex items-center space-x-3">
              {/* Location Button */}
              <button
                onClick={handleLocationToggle}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105 shadow-md focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                  useLocation
                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-blue-200"
                    : "bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-400"
                }`}
                aria-label={
                  useLocation ? "Disable location" : "Enable location"
                }
              >
                <div className="w-5 h-5">
                  <LocationIcon />
                </div>
                <span className="hidden sm:inline">
                  {useLocation
                    ? t("location.active", "Location On")
                    : t("location.inactive", "Location")}
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
                        user.email?.[0]?.toUpperCase() ||
                        "U"}
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

      {/* Profile Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
              <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {(profileData.user.first_name?.[0] || "") +
                  (profileData.user.last_name?.[0] || "") ||
                  profileData.user.email?.[0]?.toUpperCase() ||
                  "U"}
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {profileData.user.first_name || profileData.user.last_name
                    ? `${profileData.user.first_name || ""} ${
                        profileData.user.last_name || ""
                      }`.trim()
                    : profileData.user.email?.split("@")[0] || "User"}
                </h2>
                <p className="text-gray-600 capitalize mb-4">
                  {profileData.user.role} • AyurSutra Member
                </p>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{profileData.user.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{profileData.user.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Since{" "}
                      {new Date(
                        profileData.user.created_at
                      ).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={fetchUserProfile}
                  disabled={fetchingData}
                  className="flex items-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  <Activity className="w-4 h-4" />
                  <span>Refresh</span>
                </button>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center space-x-2 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Appointments</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalAppointments}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.completedAppointments}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatCurrency(stats.totalSpent)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Prescriptions</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {stats.activePrescriptions}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Pill className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Progress</p>
                  <p className="text-2xl font-bold text-teal-600">
                    {stats.progressCompletion}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-teal-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white rounded-xl shadow-lg mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: "overview", label: "Overview", icon: BarChart3 },
                  { id: "appointments", label: "Appointments", icon: Calendar },
                  { id: "prescriptions", label: "Prescriptions", icon: Pill },
                  { id: "progress", label: "Progress", icon: Activity },
                  { id: "finance", label: "Finance", icon: DollarSign },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? "border-green-500 text-green-500"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Health Overview
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">
                        Personal Information
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Date of Birth:</span>
                          <span className="font-medium">
                            {profileData.patient?.date_of_birth
                              ? new Date(
                                  profileData.patient.date_of_birth
                                ).toLocaleDateString()
                              : "Not set"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Gender:</span>
                          <span className="font-medium capitalize">
                            {profileData.patient?.gender || "Not set"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Blood Group:</span>
                          <span className="font-medium">
                            {profileData.patient?.blood_group || "Not set"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">
                        Medical Information
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-600">Allergies:</span>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {profileData.patient?.allergies?.length > 0 ? (
                              profileData.patient.allergies.map(
                                (allergy, index) => (
                                  <span
                                    key={index}
                                    className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded"
                                  >
                                    {allergy}
                                  </span>
                                )
                              )
                            ) : (
                              <span className="text-gray-500 text-xs">
                                None recorded
                              </span>
                            )}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">
                            Current Medications:
                          </span>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {profileData.patient?.current_medications?.length >
                            0 ? (
                              profileData.patient.current_medications.map(
                                (med, index) => (
                                  <span
                                    key={index}
                                    className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                                  >
                                    {med}
                                  </span>
                                )
                              )
                            ) : (
                              <span className="text-gray-500 text-xs">
                                None recorded
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">
                        Emergency Contact
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Name:</span>
                          <span className="font-medium">
                            {profileData.patient?.emergency_contact_name ||
                              "Not set"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Phone:</span>
                          <span className="font-medium">
                            {profileData.patient?.emergency_contact_phone ||
                              "Not set"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">
                        Recent Activity
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Completed online consultation</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-yellow-500" />
                          <span>Home visit scheduled</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Pill className="w-4 h-4 text-blue-500" />
                          <span>New prescription added</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "appointments" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-900">
                      My Appointments
                    </h3>
                    <button className="flex items-center space-x-2 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700">
                      <Plus className="w-4 h-4" />
                      <span>Book New</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {profileData.appointments?.length > 0 ? (
                      profileData.appointments.map((appointment) => (
                        <div
                          key={appointment.id}
                          className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {appointment.caregiver_name}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {appointment.caregiver_specializations.join(
                                  ", "
                                )}
                              </p>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                appointment.status
                              )}`}
                            >
                              {appointment.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Date:</span>
                              <p className="font-medium">
                                {new Date(
                                  appointment.start_time
                                ).toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-600">Mode:</span>
                              <p className="font-medium capitalize">
                                {appointment.mode.replace("_", " ")}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-600">Symptoms:</span>
                              <p className="font-medium">
                                {appointment.symptoms.join(", ")}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-600">Amount:</span>
                              <p className="font-medium">
                                {formatCurrency(appointment.payment_amount)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No appointments found
                        </h3>
                        <p className="text-gray-600">
                          You haven't scheduled any appointments yet.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "prescriptions" && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    My Prescriptions
                  </h3>

                  <div className="space-y-4">
                    {profileData.prescriptions.map((prescription) => (
                      <div
                        key={prescription.id}
                        className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              Prescribed by {prescription.caregiver_name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {new Date(
                                prescription.created_at
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              prescription.is_approved
                                ? "text-green-600 bg-green-100"
                                : "text-yellow-600 bg-yellow-100"
                            }`}
                          >
                            {prescription.is_approved ? "Approved" : "Pending"}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {prescription.items.map((item, index) => (
                            <div
                              key={index}
                              className="bg-white p-3 rounded border"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{item.name}</span>
                                <span className="text-sm text-gray-600">
                                  {item.dosage}
                                </span>
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                {item.frequency} • {item.duration}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "progress" && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Health Progress
                  </h3>

                  <div className="space-y-4">
                    {profileData.progressTracking.map((progress) => (
                      <div
                        key={progress.id}
                        className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900 capitalize">
                            {progress.checklist_type} Tracking
                          </h4>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 h-2 bg-gray-200 rounded-full">
                              <div
                                className="h-2 bg-green-500 rounded-full"
                                style={{
                                  width: `${progress.completion_percentage}%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">
                              {progress.completion_percentage}%
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          {new Date(progress.date).toLocaleDateString()}
                        </p>
                        <div className="space-y-2">
                          {progress.checklist_items.map((item, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-2"
                            >
                              <div
                                className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                  item.completed
                                    ? "bg-green-500 border-green-500"
                                    : "border-gray-300"
                                }`}
                              >
                                {item.completed && (
                                  <CheckCircle className="w-3 h-3 text-white" />
                                )}
                              </div>
                              <span
                                className={`text-sm ${
                                  item.completed
                                    ? "text-gray-900"
                                    : "text-gray-600"
                                }`}
                              >
                                {item.item}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "finance" && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Financial Summary
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-medium text-green-900 mb-2">
                        Total Paid
                      </h4>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(
                          profileData.financeLogs
                            .filter((log) => log.status === "completed")
                            .reduce((sum, log) => sum + log.amount, 0)
                        )}
                      </p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <h4 className="font-medium text-yellow-900 mb-2">
                        Pending
                      </h4>
                      <p className="text-2xl font-bold text-yellow-600">
                        {formatCurrency(
                          profileData.financeLogs
                            .filter((log) => log.status === "pending")
                            .reduce((sum, log) => sum + log.amount, 0)
                        )}
                      </p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2">
                        Total Transactions
                      </h4>
                      <p className="text-2xl font-bold text-blue-600">
                        {profileData.financeLogs.length}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {profileData.financeLogs.map((log) => (
                      <div
                        key={log.id}
                        className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {log.description}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {new Date(log.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">
                              {formatCurrency(log.amount)}
                            </p>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                log.status
                              )}`}
                            >
                              {log.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

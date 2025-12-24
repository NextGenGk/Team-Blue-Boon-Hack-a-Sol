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
import PrescriptionCard from "@/components/PrescriptionCard";
import ProgressChart from "@/components/ProgressChart";
import toast from "react-hot-toast";
import SidebarLayout from "@/components/SidebarLayout";

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



export default function ProfilePage() {
  const { user, loading } = useEnhancedSupabase();
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
  const [loadingPrescriptions, setLoadingPrescriptions] = useState(false);
  const [progressData, setProgressData] = useState<any>(null);
  const [loadingProgress, setLoadingProgress] = useState(false);
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

  // Auto-load progress data when progress tab is selected
  useEffect(() => {
    if (activeTab === "progress" && !loadingProgress) {
      fetchProgressData();
    }
  }, [activeTab]);

  const fetchUserProfile = async () => {
    setFetchingData(true);
    setError(null);

    try {
      if (!user?.email) {
        throw new Error("No authenticated user found");
      }

      // First, ensure user is synced to database (especially important for Google OAuth)
      console.log("Syncing user to database...");
      const syncResponse = await fetch("/api/auth/sync-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const syncResult = await syncResponse.json();
      if (syncResult.success) {
        console.log("User synced successfully:", syncResult.message);
      } else {
        console.warn("User sync failed:", syncResult.error);
      }

      // Now try to get profile
      const response = await fetch("/api/profile/simple", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const result = await response.json();

      if (result.success) {
        console.log("Profile data received:", result.data);
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
      toast.error("Location not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        setUseLocation(true);
        toast.success("Location enabled");
      },
      (error) => {
        console.error("Location error:", error);
        setUseLocation(false);
        toast.error("Location access denied");
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

  const fetchPrescriptions = async () => {
    setLoadingPrescriptions(true);
    try {
      const response = await fetch("/api/prescriptions", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const result = await response.json();

      if (result.success) {
        setProfileData(prev => ({
          ...prev,
          prescriptions: result.data
        }));
        toast.success("Prescriptions updated");
      } else {
        throw new Error(result.error || "Failed to fetch prescriptions");
      }
    } catch (err) {
      console.error("Error fetching prescriptions:", err);
      toast.error("Failed to load prescriptions");
    } finally {
      setLoadingPrescriptions(false);
    }
  };

  const fetchProgressData = async () => {
    setLoadingProgress(true);
    try {
      const response = await fetch("/api/progress", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const result = await response.json();

      if (result.success) {
        setProgressData(result);
        if (result.data?.length > 0) {
          toast.success(`Loaded ${result.data.length} progress entries`);
        }
      } else {
        throw new Error(result.error || "Failed to fetch progress data");
      }
    } catch (err) {
      console.error("Error fetching progress data:", err);
      toast.error("Failed to load progress data");
    } finally {
      setLoadingProgress(false);
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
    <SidebarLayout>
      <div
        className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50"
      >

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
                      ? `${profileData.user.first_name || ""} ${profileData.user.last_name || ""
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
                        className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
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
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-gray-900">
                        My Prescriptions
                      </h3>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-600">
                          Total: {profileData.prescriptions?.length || 0}
                        </span>
                        <button
                          onClick={fetchPrescriptions}
                          disabled={loadingPrescriptions}
                          className="flex items-center space-x-2 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                        >
                          <Activity className={`w-4 h-4 ${loadingPrescriptions ? 'animate-spin' : ''}`} />
                          <span>Refresh</span>
                        </button>
                        <Filter className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>

                    <div className="space-y-4">
                      {profileData.prescriptions?.length > 0 ? (
                        profileData.prescriptions.map((prescription) => (
                          <PrescriptionCard
                            key={prescription.id}
                            prescription={prescription}
                            onViewDetails={(presc) => {
                              console.log('View details for:', presc.id);
                              toast.success('Prescription details opened');
                            }}
                            onDownload={(presc) => {
                              console.log('Download prescription:', presc.id);
                              toast.success('Prescription download started');
                            }}
                            onShare={(presc) => {
                              console.log('Share prescription:', presc.id);
                              toast.success('Prescription shared');
                            }}
                          />
                        ))
                      ) : (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Pill className="w-8 h-8 text-gray-400" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No prescriptions found
                          </h3>
                          <p className="text-gray-600 mb-4">
                            You don't have any prescriptions yet. They will appear here after your consultations.
                          </p>
                          <button
                            onClick={() => router.push("/appointments")}
                            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <Calendar className="w-4 h-4" />
                            <span>Book Consultation</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "progress" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-gray-900">
                        Completion Rate Progress
                      </h3>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={fetchProgressData}
                          disabled={loadingProgress}
                          className="flex items-center space-x-2 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                        >
                          <Activity className={`w-4 h-4 ${loadingProgress ? 'animate-spin' : ''}`} />
                          <span>Refresh</span>
                        </button>
                      </div>
                    </div>

                    {loadingProgress ? (
                      <div className="bg-white rounded-lg p-8 border border-gray-200">
                        <div className="text-center">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                            <Activity className="w-6 h-6 text-blue-600 animate-spin" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Loading Progress Data...
                          </h3>
                          <p className="text-gray-600">
                            Please wait while we fetch your progress analytics.
                          </p>
                        </div>
                      </div>
                    ) : progressData && progressData.data && progressData.data.length > 0 ? (
                      <ProgressChart
                        data={progressData.data}
                        loading={false}
                      />
                    ) : (
                      <div className="bg-white rounded-lg p-8 border border-gray-200">
                        <div className="text-center">
                          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No Progress Data Available
                          </h3>
                          <p className="text-gray-600 mb-4">
                            No progress tracking data found. Data will appear here once you start tracking your medication compliance.
                          </p>
                        </div>
                      </div>
                    )}
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
    </SidebarLayout>
  );
}

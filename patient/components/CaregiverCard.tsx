"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEnhancedSupabase } from "@/components/EnhancedSupabaseProvider";
import { MapPin, Shield, X, Home, Video, DollarSign, Building2, Languages } from "lucide-react";
import { Caregiver, supabase } from "@/lib/supabaseClient";

import toast from "react-hot-toast";
import {
  normalizeUnsplashUrl,
  isValidImageUrl,
  getFallbackImageUrl,
  debugImageUrl,
  getHealthcareImageForId,
} from "@/utils/imageUtils";

interface CaregiverCardProps {
  caregiver: Caregiver;
  matchScore?: number;
  distance?: number;
  reason?: string;
  showBookButton?: boolean;
  showDistance?: boolean;
  showMatchScore?: boolean;
  aiReason?: string;

  className?: string;
  style?: React.CSSProperties;
}

export function CaregiverCard({
  caregiver,
  matchScore,
  distance,
  reason,
  showBookButton = false,
  showDistance = false,
  showMatchScore = false,
  aiReason,

  className = "",
  style = {},
}: CaregiverCardProps) {
  const { user, loading } = useEnhancedSupabase();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  const handleBookAppointment = async () => {
    if (loading || isBooking) return;

    if (!user) {
      toast.error("Please create an account to book an appointment");
      router.push("/sign-up");
      return;
    }

    try {
      setIsBooking(true);

      // 1. Get Patient ID using uid (matches actual database schema)
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('pid')
        .eq('uid', user.id)
        .single();

      if (patientError || !patientData) {
        console.error("Patient fetch error:", patientError);
        toast.error("Patient profile not found. Please complete your profile or contact support.");
        setIsBooking(false);
        return;
      }

      // 2. Insert Appointment (using schema field names)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];

      const { error } = await supabase.from('appointments').insert({
        pid: patientData.pid,
        did: caregiver.id,
        mode: 'online',
        status: 'scheduled',
        scheduled_date: dateStr,
        scheduled_time: '10:00:00',
        chief_complaint: 'Requested from Search'
      });

      if (error) throw error;

      toast.success("Appointment Requested Successfully! Doctor will review.");
      router.push("/patient-dashboard");
      router.refresh();

    } catch (error: any) {
      console.error("Error during booking:", error);
      toast.error(error.message || "Failed to book appointment.");
    } finally {
      setIsBooking(false);
    }
  };

  const handleViewProfile = () => {
    setShowModal(true);
  };

  // Dynamic caregiver details
  const caregiverName =
    caregiver.name ||
    `${caregiver.first_name || ""} ${caregiver.last_name || ""}`.trim() ||
    "Healthcare Provider";

  const caregiverType = caregiver.specialization || (caregiver.type ? caregiver.type.charAt(0).toUpperCase() + caregiver.type.slice(1) : "Healthcare Provider");

  const experience = caregiver.years_of_experience ?? caregiver.experience_years;

  // Clean and validate image URL
  // Prioritize the image_url from the database, otherwise generate a deterministic one
  const rawImageUrl = caregiver.image_url || caregiver.profile_image_url || getHealthcareImageForId(caregiver.id);
  const imageUrl = rawImageUrl
    ? normalizeUnsplashUrl(rawImageUrl, 400, 400)
    : null;
  const hasValidImage = imageUrl ? isValidImageUrl(imageUrl) : false;

  return (
    <>
      <div
        className={`relative flex flex-col items-center bg-gradient-to-b from-green-100 via-green-150 to-green-200 p-3 w-full h-full min-h-[480px] max-w-sm mx-auto ${className}`}
        style={{
          borderRadius: "16px",
          boxShadow:
            "0 8px 20px -5px rgba(0, 0, 0, 0.1), 0 6px 8px -6px rgba(0, 0, 0, 0.1)",
          ...style,
        }}
      >
        {/* Badges */}
        {(showMatchScore || showDistance) && (
          <div className="absolute top-2 left-2 right-2 flex justify-between items-start z-10">
            {showMatchScore && matchScore && (
              <div className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium shadow-md">
                {Math.round(matchScore)}% Match
              </div>
            )}
            {showDistance &&
              distance !== undefined &&
              distance !== null &&
              distance > 0 && (
                <div className="flex items-center bg-white/95 backdrop-blur-sm text-gray-700 px-2 py-1 rounded-full text-xs font-medium shadow-md ml-auto">
                  <MapPin className="w-2.5 h-2.5 mr-0.5" />
                  {distance.toFixed(1)} km
                </div>
              )}
          </div>
        )}

        {/* Avatar */}
        <div className="flex items-center justify-center bg-white rounded-full shadow-lg mt-8 relative">
          <div className="w-24 h-24 border-4 border-white rounded-full overflow-hidden relative">
            {hasValidImage ? (
              <img
                src={imageUrl}
                alt={caregiverName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (imageUrl?.includes("unsplash.com") && !target.src.includes("fallback")) {
                    target.src = imageUrl.replace(/\?.*/, "?w=300&h=300&fit=crop&auto=format") + "&fallback=true";
                    return;
                  }
                  target.style.display = "none";
                  const fallback = target.parentElement?.querySelector(".fallback-avatar") as HTMLElement;
                  if (fallback) fallback.style.display = "flex";
                }}
              />
            ) : null}
            <div className={`fallback-avatar absolute inset-0 w-full h-full bg-green-500 flex items-center justify-center ${hasValidImage ? "hidden" : ""}`}>
              <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-10 h-10 text-yellow-300 fill-current">
                  <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 7.5V9M15 10.5V19L13.5 17.5V10.5M10.5 10.5V19L9 17.5V10.5M9 7.5L3 7V9L9 9.5" />
                </svg>
              </div>
            </div>
          </div>
          {caregiver.is_verified && (
            <div className="absolute -top-1 -right-1 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
              <Shield className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        {/* Title & Details */}
        <div className="mt-4 text-center px-4 w-full">
          <h3 className="text-lg font-bold text-gray-900 mb-1 leading-tight line-clamp-1">
            {caregiverName}
          </h3>
          <p className="text-emerald-700 text-sm font-semibold mb-1.5">
            {caregiverType}
            {experience ? ` • ${experience} Years` : ""}
          </p>
          
          {caregiver.qualification && (
            <p className="text-gray-500 text-xs mb-2 line-clamp-1" title={caregiver.qualification}>
              {caregiver.qualification}
            </p>
          )}

          {/* Clinic & Location */}
          <div className="flex flex-col gap-1 items-center justify-center text-gray-600 mb-3">
             {caregiver.clinic_name && (
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium line-clamp-1">{caregiver.clinic_name}</span>
                </div>
              )}
              {caregiver.city && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="text-xs line-clamp-1">
                    {caregiver.city}{caregiver.state ? `, ${caregiver.state}` : ''}
                  </span>
                </div>
              )}
          </div>

          {/* Bio Snippet */}
          {caregiver.bio && (
             <p className="text-[11px] text-gray-500 italic line-clamp-2 leading-relaxed px-2 mb-2">
                "{caregiver.bio}"
             </p>
          )}
        </div>

        {/* Rating */}
        {caregiver.rating && (
          <div className="flex items-center justify-center mb-3 space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star} className={`text-lg transition-colors ${star <= Math.floor(caregiver.rating || 0) ? "text-yellow-400" : "text-gray-200"}`}>★</span>
            ))}
            <span className="text-gray-600 text-xs font-medium ml-1">
              ({caregiver.total_reviews || 0})
            </span>
          </div>
        )}

        {/* Fees and Availability */}
        <div className="mt-auto px-4 w-full space-y-3 mb-4">
          {/* Consultation Fees */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 shadow-inner border border-white/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                    <DollarSign className="w-3.5 h-3.5 text-green-600" />
                </div>
                <span className="text-xs font-semibold text-gray-700">
                  Consultation
                </span>
              </div>
              <span className="text-sm font-bold text-green-700">
                ₹{caregiver.consultation_fee || 0}
              </span>
            </div>
            {caregiver.home_visit_fee && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <Home className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-semibold text-gray-700">
                    Home Visit
                  </span>
                </div>
                <span className="text-sm font-bold text-blue-600">
                  ₹{caregiver.home_visit_fee}
                </span>
              </div>
            )}
          </div>

          {/* Languages */}
          {caregiver.languages && caregiver.languages.length > 0 && (
            <div className="flex items-start gap-1.5 px-1">
              <Languages className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
              <p className="text-[10px] text-gray-600 leading-tight">
                {caregiver.languages.slice(0, 3).join(", ")}
              </p>
            </div>
          )}

          {/* Availability Badges */}
          <div className="flex justify-center gap-2 pt-1">
            {caregiver.available_for_online && (
              <div className="flex items-center bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                <Video className="w-3 h-3 mr-1" />
                Online
              </div>
            )}
            {caregiver.available_for_home_visits && (
              <div className="flex items-center bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                <Home className="w-3 h-3 mr-1" />
                Home Visit
              </div>
            )}
          </div>
        </div>

        {/* Spacer to push buttons to bottom */}
        <div className="flex-1"></div>

        {/* Buttons */}
        <div className="flex gap-2 mt-auto mb-3 px-3 w-full flex-shrink-0">
          <button
            onClick={handleViewProfile}
            className="flex-1 py-2 px-3 bg-white border-2 border-green-600 text-green-600 font-medium rounded-md hover:bg-green-600 hover:text-white transition-all duration-300 text-xs shadow-sm hover:shadow-md"
          >
            VIEW
          </button>
          {showBookButton && (
            <button
              onClick={handleBookAppointment}
              disabled={isBooking || loading}
              className="flex-1 py-2 px-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-all duration-300 disabled:opacity-50 text-xs"
            >
              {isBooking ? "..." : loading ? "..." : "BOOK"}
            </button>
          )}
        </div>
      </div>

      {/* Profile Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="relative p-6 border-b border-gray-200">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>

              {/* Avatar */}
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-green-200 mb-4 relative">
                  {hasValidImage ? (
                    <img
                      src={imageUrl}
                      alt={caregiverName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (imageUrl?.includes("unsplash.com") && !target.src.includes("fallback")) {
                          target.src = imageUrl.replace(/\?.*/, "?w=300&h=300&fit=crop&auto=format") + "&fallback=true";
                          return;
                        }
                        target.style.display = "none";
                        const fallback = target.parentElement?.querySelector(".modal-fallback-avatar") as HTMLElement;
                        if (fallback) fallback.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div className={`modal-fallback-avatar absolute inset-0 w-full h-full bg-green-500 flex items-center justify-center ${hasValidImage ? "hidden" : ""}`}>
                    <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-10 h-10 text-yellow-300 fill-current">
                        <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 7.5V9M15 10.5V19L13.5 17.5V10.5M10.5 10.5V19L9 17.5V10.5M9 7.5L3 7V9L9 9.5" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <h2 className="text-xl font-semibold text-gray-800 mb-1">
                    {caregiverName}
                    {caregiver.is_verified && (
                      <Shield className="w-5 h-5 text-green-600 inline ml-2" />
                    )}
                  </h2>
                  <p className="text-gray-600">
                    {caregiverType}
                    {experience && ` • ${experience} years`}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Rating */}
              {caregiver.rating && (
                <div className="flex items-center justify-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className={`text-lg ${star <= Math.floor(caregiver.rating || 0) ? "text-green-500" : "text-gray-300"}`}>★</span>
                  ))}
                  <span className="text-gray-600 text-sm ml-2">
                    {caregiver.rating.toFixed(1)} ({caregiver.total_reviews || 0} reviews)
                  </span>
                </div>
              )}

              {/* Specializations */}
              {caregiver.specializations && caregiver.specializations.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Specializations</h3>
                  <div className="flex flex-wrap gap-2">
                    {caregiver.specializations.map((spec, i) => (
                      <span key={i} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Doctors/Clinics New Fields */}
              {caregiver.qualification && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Qualifications</h3>
                  <p className="text-gray-700">{caregiver.qualification}</p>
                </div>
              )}
              {caregiver.registration_number && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Registration</h3>
                  <p className="text-gray-700">{caregiver.registration_number}</p>
                </div>
              )}


              {/* Location & Service Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Service Information</h3>

                {caregiver.clinic_name && (
                  <div className="flex items-center justify-between mb-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Building2 className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">Clinic</span>
                    </div>
                    <span className="text-sm font-bold text-gray-800 text-right">{caregiver.clinic_name}</span>
                  </div>
                )}

                {caregiver.address_line1 && (
                  <div className="flex items-center justify-between mb-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">Address</span>
                    </div>
                    <span className="text-sm text-gray-600 text-right max-w-[60%]">
                      {[caregiver.address_line1, caregiver.city, caregiver.state, caregiver.postal_code].filter(Boolean).join(", ")}
                    </span>
                  </div>
                )}


                {/* Fees and existing checks */}
                <div className="bg-green-50 rounded-lg p-3 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-gray-700">Consultation Fee</span>
                    </div>
                    <span className="text-sm font-bold text-green-600">₹{caregiver.consultation_fee || 0}</span>
                  </div>
                  {caregiver.home_visit_fee && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Home className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-gray-700">Home Visit Fee</span>
                      </div>
                      <span className="text-sm font-bold text-blue-600">₹{caregiver.home_visit_fee}</span>
                    </div>
                  )}
                </div>

                {/* Availability */}
                <div className="flex flex-wrap gap-2">
                  {caregiver.available_for_online && (
                    <div className="flex items-center bg-green-100 text-green-700 px-3 py-2 rounded-full text-sm font-medium">
                      <Video className="w-4 h-4 mr-2" />
                      Online Consultation Available
                    </div>
                  )}
                  {caregiver.available_for_home_visits && (
                    <div className="flex items-center bg-blue-100 text-blue-700 px-3 py-2 rounded-full text-sm font-medium">
                      <Home className="w-4 h-4 mr-2" />
                      Home Visits Available
                    </div>
                  )}
                </div>
              </div>

              {/* Bio/Description */}
              {caregiver.bio && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">About</h3>
                  <p className="text-gray-700 leading-relaxed">{caregiver.bio}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => router.push(`/caregiver/${caregiver.id}`)}
                  className="flex-1 py-3 px-4 border-2 border-green-600 text-green-600 font-semibold rounded-xl hover:bg-green-600 hover:text-white transition-all duration-300"
                >
                  Full Profile
                </button>
                {showBookButton && (
                  <button
                    onClick={handleBookAppointment}
                    disabled={loading}
                    className="flex-1 py-3 px-4 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-all duration-300 disabled:opacity-50"
                  >
                    {loading ? "..." : "Book Now"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

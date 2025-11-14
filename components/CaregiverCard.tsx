'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { 
  MapPin, 
  Star, 
  Clock, 
  Phone,
  Calendar,
  Shield,
  Heart
} from 'lucide-react';
import { Caregiver } from '@/lib/supabaseClient';
import { useLanguage } from '@/components/LanguageProvider';
import toast from 'react-hot-toast';

interface CaregiverCardProps {
  caregiver: Caregiver;
  matchScore?: number;
  distance?: number;
  reason?: string;
  showBookButton?: boolean;
}

export function CaregiverCard({ 
  caregiver, 
  matchScore, 
  distance, 
  reason, 
  showBookButton = false 
}: CaregiverCardProps) {
  const { user } = useUser();
  const { t } = useLanguage();
  const router = useRouter();
  const [isBooking, setIsBooking] = useState(false);

  const handleBookAppointment = async () => {
    if (!user) {
      toast.error(t('auth.loginRequired', 'Please sign in to book an appointment'));
      router.push('/sign-in');
      return;
    }

    setIsBooking(true);
    try {
      // Navigate to booking page with caregiver ID
      router.push(`/book/${caregiver.id}`);
    } catch (error) {
      toast.error(t('common.error', 'An error occurred'));
    } finally {
      setIsBooking(false);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Star key="half" className="w-4 h-4 fill-yellow-400/50 text-yellow-400" />
      );
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
      );
    }

    return stars;
  };

  const getCaregiverTypeColor = (type: string) => {
    switch (type) {
      case 'doctor':
        return 'bg-blue-100 text-blue-800';
      case 'nurse':
        return 'bg-green-100 text-green-800';
      case 'maid':
        return 'bg-purple-100 text-purple-800';
      case 'therapist':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="caregiver-card animate-fade-in">
      {/* Match Score Badge */}
      {matchScore && (
        <div className="flex justify-between items-start mb-3">
          <div className="bg-health-primary text-white px-2 py-1 rounded-full text-xs font-medium">
            {Math.round(matchScore * 100)}% Match
          </div>
          {distance && (
            <div className="flex items-center text-gray-500 text-xs">
              <MapPin className="w-3 h-3 mr-1" />
              {distance.toFixed(1)} km
            </div>
          )}
        </div>
      )}

      {/* Caregiver Info */}
      <div className="flex items-start space-x-4 mb-4">
        <div className="caregiver-avatar bg-health-primary text-white flex items-center justify-center">
          {caregiver.profile_image_url ? (
            <img 
              src={caregiver.profile_image_url} 
              alt={`${caregiver.first_name} ${caregiver.last_name}`}
              className="caregiver-avatar"
            />
          ) : (
            <span className="text-lg font-semibold">
              {(caregiver.first_name?.[0] || '') + (caregiver.last_name?.[0] || '') || 'CG'}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="font-semibold text-gray-900 truncate">
              {caregiver.first_name} {caregiver.last_name}
            </h3>
            {caregiver.is_verified && (
              <Shield className="w-4 h-4 text-blue-500" title="Verified" />
            )}
          </div>

          <div className="flex items-center space-x-2 mb-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCaregiverTypeColor(caregiver.type)}`}>
              {caregiver.type.charAt(0).toUpperCase() + caregiver.type.slice(1)}
            </span>
            {caregiver.experience_years && (
              <span className="text-xs text-gray-500">
                {caregiver.experience_years} years exp.
              </span>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center space-x-2 mb-2">
            <div className="rating-stars">
              {renderStars(caregiver.rating)}
            </div>
            <span className="text-sm text-gray-600">
              {caregiver.rating.toFixed(1)} ({caregiver.total_reviews} reviews)
            </span>
          </div>

          {/* Specializations */}
          {caregiver.specializations && caregiver.specializations.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {caregiver.specializations.slice(0, 3).map((spec, index) => (
                <span 
                  key={index}
                  className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                >
                  {spec}
                </span>
              ))}
              {caregiver.specializations.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{caregiver.specializations.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* AI Reason */}
      {reason && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex items-start space-x-2">
            <Heart className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-800">{reason}</p>
          </div>
        </div>
      )}

      {/* Availability & Pricing */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <div className="flex items-center space-x-1 text-gray-600 mb-1">
            <Clock className="w-4 h-4" />
            <span>Availability</span>
          </div>
          <div className="space-y-1">
            {caregiver.available_for_online && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs">Online</span>
              </div>
            )}
            {caregiver.available_for_home_visits && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-xs">Home visits</span>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center space-x-1 text-gray-600 mb-1">
            <span>₹</span>
            <span>Fees</span>
          </div>
          <div className="space-y-1">
            {caregiver.consultation_fee && (
              <div className="text-xs">
                Consultation: ₹{caregiver.consultation_fee}
              </div>
            )}
            {caregiver.home_visit_fee && (
              <div className="text-xs">
                Home visit: ₹{caregiver.home_visit_fee}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          {caregiver.center_id && (
            <div className="flex items-center space-x-1">
              <MapPin className="w-4 h-4" />
              <span>At center</span>
            </div>
          )}
          <div className="flex items-center space-x-1">
            <Phone className="w-4 h-4" />
            <span>Available</span>
          </div>
        </div>

        {showBookButton && (
          <button
            onClick={handleBookAppointment}
            disabled={isBooking}
            className="btn-primary text-sm px-4 py-2 flex items-center space-x-1"
          >
            <Calendar className="w-4 h-4" />
            <span>{isBooking ? 'Booking...' : 'Book Now'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
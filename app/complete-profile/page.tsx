'use client';

import { useState } from 'react';
import { useEnhancedSupabase } from '@/components/EnhancedSupabaseProvider';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart, Calendar, User, Droplets, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CompleteProfilePage() {
  const { user } = useEnhancedSupabase();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
  });
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please sign in to complete your profile');
      router.push('/sign-in');
      return;
    }

    setLoading(true);

    try {
      // Update user profile in database
      const { error } = await supabase
        .from('users')
        .update({
          date_of_birth: formData.dateOfBirth,
          gender: formData.gender,
          blood_group: formData.bloodGroup,
          profile_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('auth_id', user.id);

      if (error) {
        throw error;
      }

      toast.success('Profile completed successfully!');
      router.push('/');
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to complete profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-health-primary rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">HealthPWA</h1>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Complete Your Profile</h2>
          <p className="text-gray-600">Help us provide better healthcare recommendations</p>
        </div>

        {/* Profile Form */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-2" />
                Date of Birth
              </label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-health-primary focus:border-transparent"
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="inline w-4 h-4 mr-2" />
                Gender
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-health-primary focus:border-transparent"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>

            {/* Blood Group */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Droplets className="inline w-4 h-4 mr-2" />
                Blood Group
              </label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-health-primary focus:border-transparent"
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-health-primary text-white py-3 rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Complete Profile'
                )}
              </button>
              
              <button
                type="button"
                onClick={handleSkip}
                className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50"
              >
                Skip for Now
              </button>
            </div>
          </form>

          {/* Note */}
          <div className="mt-4 text-xs text-gray-500 text-center">
            You can update this information later in your profile settings
          </div>
        </div>
      </div>
    </div>
  );
}
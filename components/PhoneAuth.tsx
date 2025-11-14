'use client';

import { useState } from 'react';
import { useSignIn, useSignUp } from '@clerk/nextjs';
import { Phone, Lock, User, Camera } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';
import toast from 'react-hot-toast';

interface PhoneAuthProps {
  mode: 'sign-in' | 'sign-up';
  onSuccess?: () => void;
}

export function PhoneAuth({ mode, onSuccess }: PhoneAuthProps) {
  const { t } = useLanguage();
  const { signIn, setActive } = useSignIn();
  const { signUp, setActive: setActiveSignUp } = useSignUp();
  
  const [step, setStep] = useState<'phone' | 'verification' | 'profile'>('phone');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    phoneNumber: '',
    code: '',
    firstName: '',
    lastName: '',
    profileImage: null as File | null,
  });

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Format phone number
      let phoneNumber = formData.phoneNumber.trim();
      if (!phoneNumber.startsWith('+')) {
        phoneNumber = '+91' + phoneNumber.replace(/^0/, '');
      }

      if (mode === 'sign-in') {
        // For sign-in, create a sign-in attempt with phone number
        const signInAttempt = await signIn?.create({
          identifier: phoneNumber,
        });

        // Prepare phone code verification
        const firstPhoneFactor = signInAttempt?.supportedFirstFactors?.find(
          (factor: any) => factor.strategy === 'phone_code'
        );

        if (firstPhoneFactor) {
          await signIn?.prepareFirstFactor({
            strategy: 'phone_code',
            phoneNumberId: firstPhoneFactor.phoneNumberId,
          });
        } else {
          throw new Error('Phone authentication not available for this number');
        }
      } else {
        // For sign-up, create new user with phone number
        await signUp?.create({
          phoneNumber,
        });
        
        // Prepare phone number verification
        await signUp?.preparePhoneNumberVerification({
          strategy: 'phone_code',
        });
      }

      // Update form data with formatted phone number
      setFormData({ ...formData, phoneNumber });
      toast.success(t('auth.otpSent', 'OTP sent to your phone'));
      setStep('verification');
    } catch (error: any) {
      console.error('Phone auth error:', error);
      const errorMessage = error.errors?.[0]?.message || error.message || 'Failed to send OTP';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'sign-in') {
        // Attempt to verify the phone code for sign-in
        const result = await signIn?.attemptFirstFactor({
          strategy: 'phone_code',
          code: formData.code,
        });

        if (result?.status === 'complete') {
          await setActive({ session: result.createdSessionId });
          toast.success(t('auth.loginSuccess', 'Login successful!'));
          onSuccess?.();
        } else if (result?.status === 'needs_second_factor') {
          // Handle MFA if enabled
          toast.error('Multi-factor authentication required');
        }
      } else {
        // Attempt to verify phone number for sign-up
        const result = await signUp?.attemptPhoneNumberVerification({
          code: formData.code,
        });

        if (result?.status === 'complete') {
          // Phone verified, now collect profile information
          setStep('profile');
        } else if (result?.status === 'missing_requirements') {
          // Still need more information
          setStep('profile');
        }
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      const errorMessage = error.errors?.[0]?.message || error.message || 'Invalid OTP';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Update user profile
      await signUp?.update({
        firstName: formData.firstName,
        lastName: formData.lastName,
      });

      // Upload profile image if provided
      if (formData.profileImage) {
        await signUp?.setProfileImage({
          file: formData.profileImage,
        });
      }

      await setActiveSignUp({ session: signUp?.createdSessionId });
      toast.success(t('auth.signupSuccess', 'Account created successfully!'));
      onSuccess?.();
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error(error.errors?.[0]?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, profileImage: file });
    }
  };

  return (
    <div className="w-full max-w-md">
      {step === 'phone' && (
        <form onSubmit={handlePhoneSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('auth.phone', 'Phone Number')}
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                required
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-health-primary focus:border-transparent"
                placeholder={t('auth.phonePlaceholder', '9876543210')}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {t('auth.phoneHint', 'Enter your 10-digit mobile number')}
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-health-primary text-white py-3 rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              t('auth.sendOtp', 'Send OTP')
            )}
          </button>
        </form>
      )}

      {step === 'verification' && (
        <form onSubmit={handleVerificationSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('auth.otp', 'Enter OTP')}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                required
                maxLength={6}
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-health-primary focus:border-transparent text-center text-lg tracking-widest"
                placeholder="000000"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {t('auth.otpHint', `OTP sent to +91${formData.phoneNumber}`)}
            </p>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setStep('phone')}
              className="text-sm text-health-primary hover:text-green-600"
            >
              {t('auth.changeNumber', 'Change Number')}
            </button>
            <span className="mx-2 text-gray-300">|</span>
            <button
              type="button"
              onClick={handlePhoneSubmit}
              className="text-sm text-health-primary hover:text-green-600"
            >
              {t('auth.resendOtp', 'Resend OTP')}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-health-primary text-white py-3 rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              t('auth.verifyOtp', 'Verify OTP')
            )}
          </button>
        </form>
      )}

      {step === 'profile' && mode === 'sign-up' && (
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          {/* Profile Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('auth.profileImage', 'Profile Image')} <span className="text-gray-400">({t('common.optional', 'Optional')})</span>
            </label>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                {formData.profileImage ? (
                  <img 
                    src={URL.createObjectURL(formData.profileImage)} 
                    alt="Profile preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Camera className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="profile-image"
                />
                <label
                  htmlFor="profile-image"
                  className="cursor-pointer bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  {t('auth.chooseImage', 'Choose Image')}
                </label>
              </div>
            </div>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.firstName', 'First Name')}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-health-primary focus:border-transparent"
                  placeholder={t('auth.firstNamePlaceholder', 'John')}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.lastName', 'Last Name')}
              </label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-health-primary focus:border-transparent"
                placeholder={t('auth.lastNamePlaceholder', 'Doe')}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-health-primary text-white py-3 rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              t('auth.createAccount', 'Create Account')
            )}
          </button>
        </form>
      )}
    </div>
  );
}
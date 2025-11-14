'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';
import { PhoneAuth } from '@/components/PhoneAuth';

export default function SignUpPage() {
  const { t } = useLanguage();
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link 
            href="/"
            className="inline-flex items-center space-x-2 text-health-primary hover:text-green-600 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('common.backToHome', 'Back to Home')}</span>
          </Link>
          
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-health-primary rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">HealthPWA</h1>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {t('auth.createAccount', 'Create Account')}
          </h2>
          <p className="text-gray-600">
            {t('auth.signupSubtitle', 'Join us with your phone number and profile image')}
          </p>
        </div>

        {/* Phone Auth Component */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <PhoneAuth mode="sign-up" onSuccess={handleSuccess} />
          
          {/* Terms */}
          <div className="text-sm text-gray-600 mt-4">
            {t('auth.termsText', 'By creating an account, you agree to our')}{' '}
            <Link href="/terms" className="text-health-primary hover:text-green-600">
              {t('auth.termsOfService', 'Terms of Service')}
            </Link>{' '}
            {t('common.and', 'and')}{' '}
            <Link href="/privacy" className="text-health-primary hover:text-green-600">
              {t('auth.privacyPolicy', 'Privacy Policy')}
            </Link>
          </div>
          
          {/* Login Link */}
          <div className="mt-6 text-center">
            <span className="text-gray-600">
              {t('auth.haveAccount', 'Already have an account?')} 
            </span>
            <Link 
              href="/sign-in"
              className="ml-1 text-health-primary hover:text-green-600 font-medium"
            >
              {t('auth.signIn', 'Sign In')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
import { Appearance } from '@clerk/types';

export const clerkAppearance: Appearance = {
  elements: {
    formButtonPrimary: 
      'bg-health-primary hover:bg-green-600 text-sm normal-case',
    card: 'bg-white shadow-sm border rounded-xl',
    headerTitle: 'text-gray-900',
    headerSubtitle: 'text-gray-600',
    socialButtonsBlockButton: 
      'border border-gray-300 hover:bg-gray-50 text-gray-700',
    socialButtonsBlockButtonText: 'font-medium',
    formFieldLabel: 'text-gray-700 font-medium',
    formFieldInput: 
      'border-gray-300 focus:border-health-primary focus:ring-health-primary',
    footerActionLink: 'text-health-primary hover:text-green-600',
    identityPreviewText: 'text-gray-700',
    identityPreviewEditButton: 'text-health-primary hover:text-green-600',
    // Hide email fields and show only phone
    formFieldInputShowPasswordButton: 'hidden',
    formFieldAction: 'hidden',
  },
  variables: {
    colorPrimary: '#10B981', // health-primary color
    colorSuccess: '#10B981',
    colorWarning: '#F59E0B',
    colorDanger: '#EF4444',
    colorNeutral: '#6B7280',
    colorText: '#111827',
    colorTextSecondary: '#6B7280',
    colorBackground: '#FFFFFF',
    colorInputBackground: '#FFFFFF',
    colorInputText: '#111827',
    borderRadius: '0.75rem',
  },
};

// Configuration for phone-only authentication
export const phoneOnlyConfig = {
  // Only allow phone number as identifier
  allowedIdentifiers: ['phone_number'],
  // Require phone number verification
  phoneNumber: {
    required: true,
  },
  // Optional: Allow profile image upload
  profileImage: {
    enabled: true,
  },
};
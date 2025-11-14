/**
 * Lingo.dev Integration for Internationalization
 * Handles UI translations and dynamic content translation
 */

// Lingo configuration
const LINGO_API_KEY = process.env.NEXT_PUBLIC_LINGO_API_KEY;
const LINGO_BASE_URL = 'https://api.lingo.dev/v1';

// Supported languages
export type SupportedLanguage = 'en' | 'hi';

// Translation interface
export interface Translation {
  key: string;
  en: string;
  hi: string;
}

// Static UI translations
export const UI_TRANSLATIONS: Record<string, Translation> = {
  // Navigation
  'nav.home': {
    key: 'nav.home',
    en: 'Home',
    hi: 'होम'
  },
  'nav.caregivers': {
    key: 'nav.caregivers',
    en: 'Caregivers',
    hi: 'देखभालकर्ता'
  },
  'nav.dashboard': {
    key: 'nav.dashboard',
    en: 'Dashboard',
    hi: 'डैशबोर्ड'
  },
  'nav.appointments': {
    key: 'nav.appointments',
    en: 'Appointments',
    hi: 'अपॉइंटमेंट'
  },

  // Search
  'search.placeholder': {
    key: 'search.placeholder',
    en: 'Describe your symptoms or health concern...',
    hi: 'अपने लक्षण या स्वास्थ्य चिंता का वर्णन करें...'
  },
  'search.useLocation': {
    key: 'search.useLocation',
    en: 'Use my location',
    hi: 'मेरा स्थान उपयोग करें'
  },
  'search.searching': {
    key: 'search.searching',
    en: 'Searching for caregivers...',
    hi: 'देखभालकर्ता खोजे जा रहे हैं...'
  },
  'search.noResults': {
    key: 'search.noResults',
    en: 'No caregivers found for your search',
    hi: 'आपकी खोज के लिए कोई देखभालकर्ता नहीं मिला'
  },

  // Caregiver types
  'caregiver.doctor': {
    key: 'caregiver.doctor',
    en: 'Doctor',
    hi: 'डॉक्टर'
  },
  'caregiver.nurse': {
    key: 'caregiver.nurse',
    en: 'Nurse',
    hi: 'नर्स'
  },
  'caregiver.maid': {
    key: 'caregiver.maid',
    en: 'Caregiver',
    hi: 'देखभालकर्ता'
  },
  'caregiver.therapist': {
    key: 'caregiver.therapist',
    en: 'Therapist',
    hi: 'चिकित्सक'
  },

  // Appointment modes
  'appointment.online': {
    key: 'appointment.online',
    en: 'Online Video Call',
    hi: 'ऑनलाइन वीडियो कॉल'
  },
  'appointment.offline': {
    key: 'appointment.offline',
    en: 'Visit Center',
    hi: 'केंद्र पर जाएं'
  },
  'appointment.homeVisit': {
    key: 'appointment.homeVisit',
    en: 'Home Visit',
    hi: 'घर पर आना'
  },

  // Booking
  'booking.selectMode': {
    key: 'booking.selectMode',
    en: 'Select consultation mode',
    hi: 'परामर्श मोड चुनें'
  },
  'booking.selectDate': {
    key: 'booking.selectDate',
    en: 'Select date and time',
    hi: 'दिनांक और समय चुनें'
  },
  'booking.symptoms': {
    key: 'booking.symptoms',
    en: 'Describe your symptoms',
    hi: 'अपने लक्षणों का वर्णन करें'
  },
  'booking.confirmBooking': {
    key: 'booking.confirmBooking',
    en: 'Confirm Booking',
    hi: 'बुकिंग की पुष्टि करें'
  },
  'booking.payNow': {
    key: 'booking.payNow',
    en: 'Pay Now',
    hi: 'अभी भुगतान करें'
  },

  // Authentication
  'auth.signIn': {
    key: 'auth.signIn',
    en: 'Sign In',
    hi: 'साइन इन करें'
  },
  'auth.signUp': {
    key: 'auth.signUp',
    en: 'Sign Up',
    hi: 'साइन अप करें'
  },
  'auth.signOut': {
    key: 'auth.signOut',
    en: 'Sign Out',
    hi: 'साइन आउट करें'
  },
  'auth.loginRequired': {
    key: 'auth.loginRequired',
    en: 'Please sign in to book appointments',
    hi: 'अपॉइंटमेंट बुक करने के लिए कृपया साइन इन करें'
  },

  // Dashboard
  'dashboard.upcomingAppointments': {
    key: 'dashboard.upcomingAppointments',
    en: 'Upcoming Appointments',
    hi: 'आगामी अपॉइंटमेंट'
  },
  'dashboard.progressTracking': {
    key: 'dashboard.progressTracking',
    en: 'Progress Tracking',
    hi: 'प्रगति ट्रैकिंग'
  },
  'dashboard.financeLog': {
    key: 'dashboard.financeLog',
    en: 'Payment History',
    hi: 'भुगतान इतिहास'
  },
  'dashboard.offlineMode': {
    key: 'dashboard.offlineMode',
    en: 'Offline Mode',
    hi: 'ऑफलाइन मोड'
  },

  // Progress tracking
  'progress.medication': {
    key: 'progress.medication',
    en: 'Medication',
    hi: 'दवा'
  },
  'progress.diet': {
    key: 'progress.diet',
    en: 'Diet',
    hi: 'आहार'
  },
  'progress.exercise': {
    key: 'progress.exercise',
    en: 'Exercise',
    hi: 'व्यायाम'
  },
  'progress.vitals': {
    key: 'progress.vitals',
    en: 'Vitals',
    hi: 'जीवन संकेत'
  },

  // Common actions
  'common.view': {
    key: 'common.view',
    en: 'View',
    hi: 'देखें'
  },
  'common.book': {
    key: 'common.book',
    en: 'Book',
    hi: 'बुक करें'
  },
  'common.cancel': {
    key: 'common.cancel',
    en: 'Cancel',
    hi: 'रद्द करें'
  },
  'common.confirm': {
    key: 'common.confirm',
    en: 'Confirm',
    hi: 'पुष्टि करें'
  },
  'common.save': {
    key: 'common.save',
    en: 'Save',
    hi: 'सेव करें'
  },
  'common.loading': {
    key: 'common.loading',
    en: 'Loading...',
    hi: 'लोड हो रहा है...'
  },
  'common.error': {
    key: 'common.error',
    en: 'An error occurred',
    hi: 'एक त्रुटि हुई'
  },

  // Status messages
  'status.success': {
    key: 'status.success',
    en: 'Success',
    hi: 'सफलता'
  },
  'status.failed': {
    key: 'status.failed',
    en: 'Failed',
    hi: 'असफल'
  },
  'status.pending': {
    key: 'status.pending',
    en: 'Pending',
    hi: 'लंबित'
  },
  'status.confirmed': {
    key: 'status.confirmed',
    en: 'Confirmed',
    hi: 'पुष्ट'
  },
  'status.completed': {
    key: 'status.completed',
    en: 'Completed',
    hi: 'पूर्ण'
  },
  'status.cancelled': {
    key: 'status.cancelled',
    en: 'Cancelled',
    hi: 'रद्द'
  },

  // Medical disclaimers
  'disclaimer.aiAdvice': {
    key: 'disclaimer.aiAdvice',
    en: 'This AI-generated advice is for informational purposes only and should not replace professional medical consultation.',
    hi: 'यह AI-जनित सलाह केवल सूचनात्मक उद्देश्यों के लिए है और पेशेवर चिकित्सा परामर्श का विकल्प नहीं होना चाहिए।'
  },
  'disclaimer.emergency': {
    key: 'disclaimer.emergency',
    en: 'In case of emergency, please call 102 or visit the nearest hospital immediately.',
    hi: 'आपातकाल की स्थिति में, कृपया 102 पर कॉल करें या तुरंत निकटतम अस्पताल जाएं।'
  }
};

// Language context
export interface LanguageContextType {
  currentLanguage: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string, fallback?: string) => string;
  translateText: (text: string, targetLang: SupportedLanguage) => Promise<string>;
}

// Get translation for a key
export const getTranslation = (key: string, language: SupportedLanguage, fallback?: string): string => {
  const translation = UI_TRANSLATIONS[key];
  if (translation) {
    return translation[language] || translation.en || fallback || key;
  }
  return fallback || key;
};

// Translate dynamic text using Lingo API
export const translateText = async (
  text: string,
  targetLanguage: SupportedLanguage,
  sourceLanguage: SupportedLanguage = 'en'
): Promise<string> => {
  if (!LINGO_API_KEY) {
    console.warn('Lingo API key not configured, returning original text');
    return text;
  }

  if (sourceLanguage === targetLanguage) {
    return text;
  }

  try {
    const response = await fetch(`${LINGO_BASE_URL}/translate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LINGO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        source_language: sourceLanguage,
        target_language: targetLanguage,
      }),
    });

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.status}`);
    }

    const data = await response.json();
    return data.translated_text || text;
  } catch (error) {
    console.error('Translation failed:', error);
    return text; // Return original text on failure
  }
};

// Batch translate multiple texts
export const translateBatch = async (
  texts: string[],
  targetLanguage: SupportedLanguage,
  sourceLanguage: SupportedLanguage = 'en'
): Promise<string[]> => {
  if (!LINGO_API_KEY || sourceLanguage === targetLanguage) {
    return texts;
  }

  try {
    const response = await fetch(`${LINGO_BASE_URL}/translate/batch`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LINGO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        texts,
        source_language: sourceLanguage,
        target_language: targetLanguage,
      }),
    });

    if (!response.ok) {
      throw new Error(`Batch translation API error: ${response.status}`);
    }

    const data = await response.json();
    return data.translated_texts || texts;
  } catch (error) {
    console.error('Batch translation failed:', error);
    return texts;
  }
};

// Auto-translate caregiver bio
export const translateCaregiverBio = async (
  bioEn: string,
  targetLanguage: SupportedLanguage = 'hi'
): Promise<string> => {
  return await translateText(bioEn, targetLanguage, 'en');
};

// Language detection (basic implementation)
export const detectLanguage = (text: string): SupportedLanguage => {
  // Simple heuristic: check for Hindi characters
  const hindiRegex = /[\u0900-\u097F]/;
  return hindiRegex.test(text) ? 'hi' : 'en';
};

// Format numbers according to locale
export const formatNumber = (number: number, language: SupportedLanguage): string => {
  const locale = language === 'hi' ? 'hi-IN' : 'en-IN';
  return new Intl.NumberFormat(locale).format(number);
};

// Format currency according to locale
export const formatCurrency = (amount: number, language: SupportedLanguage): string => {
  const locale = language === 'hi' ? 'hi-IN' : 'en-IN';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

// Format date according to locale
export const formatDate = (date: Date | string, language: SupportedLanguage): string => {
  const locale = language === 'hi' ? 'hi-IN' : 'en-IN';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj);
};

// Format time according to locale
export const formatTime = (date: Date | string, language: SupportedLanguage): string => {
  const locale = language === 'hi' ? 'hi-IN' : 'en-IN';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(dateObj);
};

// Get browser language preference
export const getBrowserLanguage = (): SupportedLanguage => {
  if (typeof window === 'undefined') return 'en';
  
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('hi')) return 'hi';
  return 'en';
};

// Language storage key
const LANGUAGE_STORAGE_KEY = 'healthpwa_language';

// Save language preference
export const saveLanguagePreference = (language: SupportedLanguage): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }
};

// Load language preference
export const loadLanguagePreference = (): SupportedLanguage => {
  if (typeof window === 'undefined') return 'en';
  
  const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY) as SupportedLanguage;
  return saved || getBrowserLanguage();
};

// RTL support for Hindi (if needed in future)
export const getTextDirection = (language: SupportedLanguage): 'ltr' | 'rtl' => {
  // Hindi is LTR, but this function is ready for RTL languages
  return 'ltr';
};

// Language-specific font classes
export const getLanguageFont = (language: SupportedLanguage): string => {
  switch (language) {
    case 'hi':
      return 'font-hindi'; // Define this in your CSS
    case 'en':
    default:
      return 'font-english';
  }
};
"use client";
import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'hi';

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Simple translations
const translations = {
  en: {
    'hero.title': 'Find the Right Healthcare Professional',
    'hero.subtitle': 'Describe your symptoms and get AI-powered recommendations for doctors, nurses, and caregivers near you.',
    'search.placeholder': 'Describe your symptoms or health concern...',
    'search.useLocation': 'Use my location',
    'search.newSearch': 'New Search',
    'search.noResults': 'No caregivers found for your search',
    'search.foundResults': 'Found matching caregivers',
    'features.aiSearch': 'AI-Powered Search',
    'features.aiSearchDesc': 'Get personalized caregiver recommendations based on your symptoms and location.',
    'features.secure': 'Secure & Private',
    'features.secureDesc': 'Your medical data is encrypted end-to-end and stored securely.',
    'features.multilingual': 'Bilingual Support',
    'features.multilingualDesc': 'Available in English and Hindi for better accessibility.',
    'auth.signIn': 'Sign In',
    'auth.signUp': 'Sign Up',
    'auth.loginRequired': 'Please sign in to book an appointment',
    'common.error': 'An error occurred',
    'disclaimer.title': 'Medical Disclaimer',
    'disclaimer.aiAdvice': 'This AI-generated advice is for informational purposes only and should not replace professional medical consultation.',
    'disclaimer.emergency': 'In case of emergency, please call 102 or visit the nearest hospital immediately.',
    'profile.view': 'View Profile',
    'demo.title': 'Translation Demo',
    'error.locationNotSupported': 'Location not supported',
    'error.locationDenied': 'Location access denied',
    'success.locationEnabled': 'Location enabled',
  },
  hi: {
    'hero.title': 'सही स्वास्थ्य सेवा प्रदाता खोजें',
    'hero.subtitle': 'अपने लक्षणों का वर्णन करें और अपने आस-पास के डॉक्टरों, नर्सों और देखभालकर्ताओं के लिए AI-संचालित सिफारिशें प्राप्त करें।',
    'search.placeholder': 'अपने लक्षणों या स्वास्थ्य संबंधी चिंता का वर्णन करें...',
    'search.useLocation': 'मेरा स्थान उपयोग करें',
    'search.newSearch': 'नई खोज',
    'search.noResults': 'आपकी खोज के लिए कोई देखभालकर्ता नहीं मिला',
    'search.foundResults': 'मिलान करने वाले देखभालकर्ता मिले',
    'features.aiSearch': 'AI-संचालित खोज',
    'features.aiSearchDesc': 'अपने लक्षणों और स्थान के आधार पर व्यक्तिगत देखभालकर्ता सिफारिशें प्राप्त करें।',
    'features.secure': 'सुरक्षित और निजी',
    'features.secureDesc': 'आपका चिकित्सा डेटा एंड-टू-एंड एन्क्रिप्टेड है और सुरक्षित रूप से संग्रहीत है।',
    'features.multilingual': 'द्विभाषी समर्थन',
    'features.multilingualDesc': 'बेहतर पहुंच के लिए अंग्रेजी और हिंदी में उपलब्ध।',
    'auth.signIn': 'साइन इन',
    'auth.signUp': 'साइन अप',
    'auth.loginRequired': 'कृपया अपॉइंटमेंट बुक करने के लिए साइन इन करें',
    'common.error': 'एक त्रुटि हुई',
    'disclaimer.title': 'चिकित्सा अस्वीकरण',
    'disclaimer.aiAdvice': 'यह AI-जनरेटेड सलाह केवल सूचनात्मक उद्देश्यों के लिए है और पेशेवर चिकित्सा परामर्श का विकल्प नहीं होनी चाहिए।',
    'disclaimer.emergency': 'आपातकाल की स्थिति में, कृपया 102 पर कॉल करें या तुरंत निकटतम अस्पताल जाएं।',
    'profile.view': 'प्रोफ़ाइल देखें',
    'demo.title': 'अनुवाद डेमो',
    'error.locationNotSupported': 'स्थान समर्थित नहीं है',
    'error.locationDenied': 'स्थान पहुंच अस्वीकृत',
    'success.locationEnabled': 'स्थान सक्षम',
  }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');

  const setLanguage = (lang: Language) => {
    setCurrentLanguage(lang);
  };

  const t = (key: string, fallback: string) => {
    const translation = translations[currentLanguage][key as keyof typeof translations['en']];
    return translation || fallback;
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
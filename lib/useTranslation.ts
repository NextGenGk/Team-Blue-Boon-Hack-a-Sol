import { useLanguage } from '@/components/LanguageProvider';

export function useTranslation() {
  const { currentLanguage, t } = useLanguage();

  const getErrorMessage = (key: string, fallback: string) => {
    return t(`error.${key}`, fallback);
  };

  const getSuccessMessage = (key: string, fallback: string) => {
    return t(`success.${key}`, fallback);
  };

  const getLanguageClass = () => {
    return currentLanguage === 'hi' ? 'font-hindi' : '';
  };

  return {
    t,
    currentLanguage,
    getErrorMessage,
    getSuccessMessage,
    getLanguageClass,
  };
}
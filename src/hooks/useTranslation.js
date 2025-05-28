import { useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';

export const useTranslation = () => {
  const { language, translations, setLanguage } = useContext(LanguageContext);

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];

    for (const k of keys) {
      if (!value || !value[k]) {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
      value = value[k];
    }

    return value;
  };

  return { t, currentLanguage: language, setLanguage };
}; 
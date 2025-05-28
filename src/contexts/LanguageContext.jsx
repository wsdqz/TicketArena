import React, { createContext, useState, useEffect } from 'react';
import enTranslations from '../locales/en.json';
import ruTranslations from '../locales/ru.json';

export const LanguageContext = createContext();

const translations = {
  en: enTranslations,
  ru: ruTranslations
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('language');
    return savedLanguage || 'ru';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
  }, [language]);

  const value = {
    language,
    setLanguage,
    translations
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}; 
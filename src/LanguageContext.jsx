import React, { createContext, useState, useContext, useEffect } from 'react';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import engJson from './locales/eng.json';
import tagJson from './locales/tag.json';
import japJson from './locales/jap.json';
import chiJson from './locales/chi.json';
import korJson from './locales/kor.json';

i18next
  .use(initReactI18next)
  .init({
    resources: {
      eng: { translation: engJson },
      tag: { translation: tagJson },
      jap: { translation: japJson },
      chi: { translation: chiJson },
      kor: { translation: korJson }
    },
    lng: localStorage.getItem('artifact_language') || 'eng',
    fallbackLng: 'eng',
    interpolation: { escapeValue: false }
  });

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  const [currentLang, setLangState] = useState(i18next.language);

  const setCurrentLang = (lang) => {
    i18next.changeLanguage(lang);
    setLangState(lang);
    localStorage.setItem('artifact_language', lang);
  };

  return (
    <LanguageContext.Provider value={{ currentLang, setCurrentLang }}>
      {children}
    </LanguageContext.Provider>
  );
};
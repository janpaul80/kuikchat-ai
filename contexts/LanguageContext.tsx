import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

// Define a type for your translations
type Translations = { [key: string]: string | Translations };

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string, replacements?: { [key: string]: string | number }) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const supportedLanguages = ['en', 'es', 'fr'];

// A simple key path resolver
const resolve = (path: string, obj: Translations): string => {
  const resolved = path.split('.').reduce((prev, curr) => {
    return prev && typeof prev === 'object' && (prev as any)[curr] ? (prev as any)[curr] : path;
  }, obj);
  return typeof resolved === 'string' ? resolved : path;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<string>(() => {
    if (typeof window === 'undefined') return 'en';
    return localStorage.getItem('kuikchat_language') || 'en';
  });
  const [loadedTranslations, setLoadedTranslations] = useState<Translations>({});

  useEffect(() => {
    const loadTranslations = async (lang: string) => {
      try {
        const response = await fetch(`/locales/${lang}.json`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setLoadedTranslations(data);
      } catch (error) {
        console.error(`Could not load translations for ${lang}`, error);
        // Fallback to English if the selected language fails to load
        if (lang !== 'en') {
          loadTranslations('en');
        }
      }
    };
    loadTranslations(language);
  }, [language]);

  const setLanguage = (lang: string) => {
    if (supportedLanguages.includes(lang)) {
      localStorage.setItem('kuikchat_language', lang);
      setLanguageState(lang);
    }
  };

  const t = useCallback((key: string, replacements?: { [key: string]: string | number }): string => {
    let translation = resolve(key, loadedTranslations);
    if (replacements) {
        Object.keys(replacements).forEach(rKey => {
            translation = translation.replace(`{${rKey}}`, String(replacements[rKey]));
        });
    }
    return translation;
  }, [loadedTranslations]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

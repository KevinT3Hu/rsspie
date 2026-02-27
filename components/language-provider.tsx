'use client';

import { useState, useEffect, ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import type { Locale } from '@/i18n/config';
import { getMessages } from '@/i18n/messages';

const STORAGE_KEY = 'rss-reader-language';

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [locale, setLocale] = useState<Locale>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (stored && (stored === 'en' || stored === 'zh')) {
      setLocale(stored);
      document.documentElement.lang = stored;
    }
  }, []);

  // Listen for locale changes from other components
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        const newLocale = (e.newValue as Locale) || 'en';
        setLocale(newLocale);
        document.documentElement.lang = newLocale;
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const messages = getMessages(locale);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <NextIntlClientProvider locale="en" messages={getMessages('en')}>
        {children}
      </NextIntlClientProvider>
    );
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}

export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (stored && (stored === 'en' || stored === 'zh')) {
      setLocaleState(stored);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    localStorage.setItem(STORAGE_KEY, newLocale);
    setLocaleState(newLocale);
    document.documentElement.lang = newLocale;
    // Trigger a re-render by dispatching a custom event
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY, newValue: newLocale }));
    // Force reload to apply new locale everywhere
    window.location.reload();
  };

  return { locale, setLocale };
}

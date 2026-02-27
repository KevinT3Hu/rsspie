import type { Locale } from './config';

// Import messages directly for synchronous access
import enMessages from '../messages/en.json';
import zhMessages from '../messages/zh.json';

const messages: Record<Locale, typeof enMessages> = {
  en: enMessages,
  zh: zhMessages,
};

export function getMessages(locale: Locale) {
  return messages[locale] || messages.en;
}

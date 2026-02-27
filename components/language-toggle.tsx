'use client';

import { Languages } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useLocale } from './language-provider';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function LanguageToggle() {
  const { locale, setLocale } = useLocale();
  const t = useTranslations('language');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Languages className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">{t('toggle')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLocale('en')}>
          <span className={locale === 'en' ? 'font-bold' : ''}>
            {t('english')}
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLocale('zh')}>
          <span className={locale === 'zh' ? 'font-bold' : ''}>
            {t('chinese')}
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

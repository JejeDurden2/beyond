'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { locales, type Locale } from '../../../../i18n.config';

const localeLabels: Record<Locale, { flag: string; name: string; shortName: string }> = {
  fr: { flag: '🇫🇷', name: 'Français', shortName: 'FR' },
  en: { flag: '🇬🇧', name: 'English', shortName: 'EN' },
};

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: Locale) => {
    if (locale === newLocale) return; // Don't switch if already on this locale
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className="flex items-center gap-1 p-1 rounded-full bg-muted/50 border border-border/40">
      {locales.map((loc) => {
        const isActive = locale === loc;
        const { shortName } = localeLabels[loc];

        return (
          <button
            key={loc}
            onClick={() => switchLocale(loc)}
            className={`
              px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ease-out
              ${
                isActive
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }
            `}
            aria-label={localeLabels[loc].name}
            aria-pressed={isActive}
          >
            {shortName}
          </button>
        );
      })}
    </div>
  );
}

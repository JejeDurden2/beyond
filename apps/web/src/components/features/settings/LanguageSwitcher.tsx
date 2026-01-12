'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { locales, type Locale } from '../../../../i18n.config';

const localeLabels: Record<Locale, { name: string; shortName: string }> = {
  fr: { name: 'Français', shortName: 'FR' },
  en: { name: 'English', shortName: 'EN' },
};

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(newLocale: Locale): void {
    if (locale === newLocale) return;
    router.replace(pathname, { locale: newLocale });
  }

  return (
    <div className="flex items-center gap-1 p-1 rounded-full bg-muted/50 border border-border/40">
      {locales.map((loc) => {
        const isActive = locale === loc;
        const { name, shortName } = localeLabels[loc];
        const activeStyles = 'bg-background text-foreground shadow-sm';
        const inactiveStyles = 'text-muted-foreground hover:text-foreground';

        return (
          <button
            key={loc}
            onClick={() => switchLocale(loc)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ease-out ${isActive ? activeStyles : inactiveStyles}`}
            aria-label={name}
            aria-pressed={isActive}
          >
            {shortName}
          </button>
        );
      })}
    </div>
  );
}

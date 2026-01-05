'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { locales, type Locale } from '../../../../i18n.config';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('settings.language');

  const switchLocale = (newLocale: Locale) => {
    // Remove current locale prefix if present
    const pathWithoutLocale = pathname.replace(/^\/(fr|en)/, '') || '/';
    // Add new locale prefix (fr is default, so no prefix needed)
    const newPath = newLocale === 'fr' ? pathWithoutLocale : `/${newLocale}${pathWithoutLocale}`;
    router.push(newPath);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">{t('title')}:</span>
      <select
        value={locale}
        onChange={(e) => switchLocale(e.target.value as Locale)}
        className="rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-colors duration-200 ease-out"
      >
        {locales.map((loc) => (
          <option key={loc} value={loc}>
            {t(loc)}
          </option>
        ))}
      </select>
    </div>
  );
}

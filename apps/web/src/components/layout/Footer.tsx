import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export function Footer(): React.ReactElement {
  const t = useTranslations('legal');
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-warm-gray bg-cream py-12 px-6">
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
        <div>
          <h3 className="mb-3 font-serif-brand text-lg font-medium text-navy-deep">
            {t('footer.about')}
          </h3>
          <p className="text-sm leading-relaxed text-slate">{t('footer.aboutDescription')}</p>
        </div>

        <div>
          <h3 className="mb-3 font-serif-brand text-lg font-medium text-navy-deep">
            {t('footer.legal')}
          </h3>
          <ul className="space-y-2">
            <li>
              <Link
                href="/legal/terms"
                className="text-sm text-navy-light transition-colors hover:text-gold-heritage"
              >
                {t('nav.terms')}
              </Link>
            </li>
            <li>
              <Link
                href="/legal/disclaimer"
                className="text-sm text-navy-light transition-colors hover:text-gold-heritage"
              >
                {t('nav.disclaimer')}
              </Link>
            </li>
            <li>
              <Link
                href="/legal/privacy"
                className="text-sm text-navy-light transition-colors hover:text-gold-heritage"
              >
                {t('nav.privacy')}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 font-serif-brand text-lg font-medium text-navy-deep">
            {t('footer.contact')}
          </h3>
          <a
            href={`mailto:${t('footer.contactEmail')}`}
            className="text-sm text-navy-light transition-colors hover:text-gold-heritage"
          >
            {t('footer.contactEmail')}
          </a>
        </div>
      </div>

      <div className="mt-12 text-center text-sm text-slate">
        {t('footer.copyright', { year: currentYear })}
      </div>
    </footer>
  );
}

'use client';

import { Link, usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { User } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { LanguageSwitcher } from '@/components/features/settings';
import { Logo } from '@/components/ui';

export function Header() {
  const { isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const t = useTranslations('nav');
  const tLanding = useTranslations('landing.hero');

  const isActive = (path: string) => pathname === path || pathname.endsWith(path);

  return (
    <header className="border-b border-warm-gray bg-cream/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href={isAuthenticated ? '/dashboard' : '/'} className="flex items-center">
            <Logo variant="symbol" className="h-8 md:hidden" />
            <Logo variant="full" className="hidden md:block h-10" />
          </Link>

          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/dashboard"
                className={`text-sm font-medium transition-colors duration-200 ease-out ${
                  isActive('/dashboard')
                    ? 'text-navy-deep'
                    : 'text-navy-light hover:text-gold-heritage'
                }`}
              >
                {t('dashboard')}
              </Link>
              <Link
                href="/keepsakes"
                className={`text-sm font-medium transition-colors duration-200 ease-out ${
                  pathname.includes('/keepsakes')
                    ? 'text-navy-deep'
                    : 'text-navy-light hover:text-gold-heritage'
                }`}
              >
                {t('keepsakes')}
              </Link>
              <Link
                href="/beneficiaries"
                className={`text-sm font-medium transition-colors duration-200 ease-out ${
                  pathname.includes('/beneficiaries')
                    ? 'text-navy-deep'
                    : 'text-navy-light hover:text-gold-heritage'
                }`}
              >
                {t('beneficiaries')}
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <LanguageSwitcher />
          </div>
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                href="/settings/profile"
                className={`p-2 rounded-lg transition-colors ${
                  pathname.includes('/settings')
                    ? 'text-navy-deep bg-warm-gray/50'
                    : 'text-navy-light hover:text-navy-deep hover:bg-warm-gray/50'
                }`}
                title={t('settings')}
              >
                <User className="w-5 h-5" />
              </Link>
              <button
                onClick={logout}
                className="text-sm font-medium text-navy-light hover:text-gold-heritage transition-colors duration-200 ease-out"
              >
                {t('logout')}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-navy-light hover:text-gold-heritage transition-colors duration-200 ease-out"
              >
                {t('login')}
              </Link>
              <Link
                href="/register"
                className="bg-gold-heritage text-cream hover:bg-gold-soft rounded-lg px-4 py-2 text-sm font-medium shadow-soft transition-all duration-200 ease-out hover:shadow-soft-md"
              >
                {tLanding('ctaGuest')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

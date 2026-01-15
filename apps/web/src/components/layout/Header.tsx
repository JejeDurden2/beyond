'use client';

import { useState, useEffect, useCallback } from 'react';
import { Link, usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Menu, X, User, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { LanguageSwitcher } from '@/components/features/settings';
import { RoleSwitcher } from '@/components/features/navigation';
import { Logo } from '@/components/ui';

interface NavLinkProps {
  href: string;
  isActive: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

function NavLink({ href, isActive, children, onClick }: NavLinkProps): React.ReactElement {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`relative text-sm font-medium transition-colors duration-200 ease-out ${
        isActive ? 'text-navy-deep' : 'text-navy-light hover:text-navy-deep'
      }`}
    >
      {children}
      {isActive && (
        <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gold-heritage rounded-full" />
      )}
    </Link>
  );
}

interface MobileNavLinkProps {
  href: string;
  isActive: boolean;
  children: React.ReactNode;
  onClick: () => void;
}

function MobileNavLink({
  href,
  isActive,
  children,
  onClick,
}: MobileNavLinkProps): React.ReactElement {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center justify-between py-3 px-4 rounded-xl text-base font-medium transition-all duration-200 ease-out ${
        isActive
          ? 'bg-gold-heritage/10 text-navy-deep'
          : 'text-navy-light hover:bg-warm-gray/50 hover:text-navy-deep'
      }`}
    >
      <span>{children}</span>
      <ChevronRight
        className={`w-4 h-4 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0'}`}
      />
    </Link>
  );
}

export function Header(): React.ReactElement {
  const { isAuthenticated, isLoading, user } = useAuth();
  const pathname = usePathname();
  const t = useTranslations('nav');
  const tLanding = useTranslations('landing.hero');

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    closeMobileMenu();
  }, [pathname, closeMobileMenu]);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        closeMobileMenu();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [mobileMenuOpen, closeMobileMenu]);

  const isActive = (path: string): boolean => pathname === path || pathname.startsWith(path + '/');

  // During loading, check localStorage to prevent menu flickering
  const hadToken = typeof window !== 'undefined' && localStorage.getItem('accessToken') !== null;
  const showAuthenticatedUI = isLoading ? hadToken : isAuthenticated;

  // Role-based navigation
  const canAccessVault = user?.role === 'VAULT_OWNER' || user?.role === 'BOTH';
  const canAccessPortal = user?.role === 'BENEFICIARY' || user?.role === 'BOTH';
  const showVaultMenu = isLoading ? hadToken : canAccessVault;
  const showPortalMenu = isLoading ? false : canAccessPortal;

  const getHomeLink = (): string => {
    if (!isAuthenticated) return '/';
    if (user?.role === 'BENEFICIARY') return '/portal';
    return '/dashboard';
  };

  return (
    <>
      <header className="border-b border-warm-gray bg-cream/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="h-16 flex items-center justify-between">
            {/* Logo */}
            <Link
              href={getHomeLink()}
              className="flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-heritage/50 rounded-lg"
              aria-label="Beyond - Home"
            >
              <Logo variant="symbol" className="h-8 md:hidden" />
              <Logo variant="full" className="hidden md:block h-9" />
            </Link>

            {/* Desktop Navigation */}
            {showAuthenticatedUI && (
              <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
                {showVaultMenu && (
                  <>
                    <NavLink href="/dashboard" isActive={isActive('/dashboard')}>
                      {t('dashboard')}
                    </NavLink>
                    <NavLink href="/keepsakes" isActive={isActive('/keepsakes')}>
                      {t('keepsakes')}
                    </NavLink>
                    <NavLink href="/beneficiaries" isActive={isActive('/beneficiaries')}>
                      {t('beneficiaries')}
                    </NavLink>
                  </>
                )}
                {showPortalMenu && (
                  <NavLink href="/portal" isActive={isActive('/portal')}>
                    {t('portal')}
                  </NavLink>
                )}
              </nav>
            )}

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              {!isLoading && isAuthenticated && user?.role === 'BOTH' && <RoleSwitcher />}
              <LanguageSwitcher />
              {showAuthenticatedUI ? (
                <Link
                  href="/settings/profile"
                  className={`p-2.5 rounded-xl transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-heritage/50 ${
                    isActive('/settings')
                      ? 'text-navy-deep bg-gold-heritage/10'
                      : 'text-navy-light hover:text-navy-deep hover:bg-warm-gray/50'
                  }`}
                  aria-label={t('settings')}
                >
                  <User className="w-5 h-5" />
                </Link>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    href="/login"
                    className="text-sm font-medium text-navy-light hover:text-navy-deep transition-colors duration-200 ease-out px-3 py-2 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-heritage/50"
                  >
                    {t('login')}
                  </Link>
                  <Link
                    href="/register"
                    className="bg-gold-heritage text-cream hover:bg-gold-soft rounded-xl px-5 py-2.5 text-sm font-medium shadow-soft transition-all duration-200 ease-out hover:shadow-soft-md focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-heritage/50 focus-visible:ring-offset-2"
                  >
                    {tLanding('ctaGuest')}
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden p-2 rounded-lg text-navy-light hover:text-navy-deep hover:bg-warm-gray/50 transition-colors duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-heritage/50"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <button
            type="button"
            className="absolute inset-0 bg-navy-deep/20 backdrop-blur-sm animate-fade-in cursor-default"
            onClick={closeMobileMenu}
            aria-label="Close menu"
          />

          {/* Menu Panel */}
          <nav
            id="mobile-menu"
            className="absolute top-16 left-0 right-0 bg-cream border-b border-warm-gray shadow-soft-lg animate-slide-up max-h-[calc(100vh-4rem)] overflow-y-auto"
            aria-label="Mobile navigation"
          >
            <div className="p-4 space-y-2">
              {showAuthenticatedUI ? (
                <>
                  {showVaultMenu && (
                    <>
                      <MobileNavLink
                        href="/dashboard"
                        isActive={isActive('/dashboard')}
                        onClick={closeMobileMenu}
                      >
                        {t('dashboard')}
                      </MobileNavLink>
                      <MobileNavLink
                        href="/keepsakes"
                        isActive={isActive('/keepsakes')}
                        onClick={closeMobileMenu}
                      >
                        {t('keepsakes')}
                      </MobileNavLink>
                      <MobileNavLink
                        href="/beneficiaries"
                        isActive={isActive('/beneficiaries')}
                        onClick={closeMobileMenu}
                      >
                        {t('beneficiaries')}
                      </MobileNavLink>
                    </>
                  )}
                  {showPortalMenu && (
                    <MobileNavLink
                      href="/portal"
                      isActive={isActive('/portal')}
                      onClick={closeMobileMenu}
                    >
                      {t('portal')}
                    </MobileNavLink>
                  )}

                  <div className="h-px bg-border/40 my-3" />

                  <MobileNavLink
                    href="/settings/profile"
                    isActive={isActive('/settings')}
                    onClick={closeMobileMenu}
                  >
                    {t('settings')}
                  </MobileNavLink>

                  {!isLoading && isAuthenticated && user?.role === 'BOTH' && (
                    <div className="pt-2">
                      <RoleSwitcher />
                    </div>
                  )}
                </>
              ) : (
                <>
                  <MobileNavLink
                    href="/login"
                    isActive={isActive('/login')}
                    onClick={closeMobileMenu}
                  >
                    {t('login')}
                  </MobileNavLink>
                  <div className="pt-2">
                    <Link
                      href="/register"
                      onClick={closeMobileMenu}
                      className="block w-full text-center bg-gold-heritage text-cream hover:bg-gold-soft rounded-xl px-5 py-3 text-base font-medium shadow-soft transition-all duration-200 ease-out"
                    >
                      {tLanding('ctaGuest')}
                    </Link>
                  </div>
                </>
              )}

              {/* Language Switcher */}
              <div className="pt-4 pb-2 flex justify-center">
                <LanguageSwitcher />
              </div>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}

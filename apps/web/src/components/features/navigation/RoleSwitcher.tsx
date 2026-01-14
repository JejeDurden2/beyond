'use client';

import { usePathname } from '@/i18n/navigation';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Vault, Heart, ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useState, useRef, useEffect } from 'react';

type ActiveView = 'vault' | 'portal';

export function RoleSwitcher() {
  const { user } = useAuth();
  const pathname = usePathname();
  const t = useTranslations('nav');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Only show for users with BOTH role
  if (user?.role !== 'BOTH') {
    return null;
  }

  // Determine current view based on pathname
  const isPortalView = pathname.includes('/portal');
  const activeView: ActiveView = isPortalView ? 'portal' : 'vault';

  const views = {
    vault: {
      label: t('myVault'),
      icon: Vault,
      href: '/dashboard',
    },
    portal: {
      label: t('myInheritance'),
      icon: Heart,
      href: '/portal',
    },
  };

  const currentView = views[activeView];
  const otherView = views[activeView === 'vault' ? 'portal' : 'vault'];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-navy-deep bg-warm-gray/50 hover:bg-warm-gray rounded-lg transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <currentView.icon className="w-4 h-4" />
        <span className="hidden sm:inline">{currentView.label}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-cream border border-warm-gray rounded-lg shadow-soft-md py-1 z-50">
          <div className="px-3 py-2 text-xs font-medium text-navy-light uppercase tracking-wider">
            {t('switchView')}
          </div>
          <Link
            href={otherView.href}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-3 py-2 text-sm text-navy-deep hover:bg-warm-gray/50 transition-colors"
          >
            <otherView.icon className="w-4 h-4" />
            {otherView.label}
          </Link>
        </div>
      )}
    </div>
  );
}

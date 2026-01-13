'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { LogOut, Download } from 'lucide-react';
import { AppShell } from '@/components/layout';
import {
  ProfileHeader,
  ProfileSection,
  ProfileField,
  ChangePasswordDialog,
  DeleteAccountDialog,
} from '@/components/features/profile';
import { useAuth } from '@/hooks/use-auth';
import { updateProfile, exportUserData } from '@/lib/api/users';
import { formatDate } from '@/lib/constants';

export default function ProfilePage() {
  const t = useTranslations('profile');
  const { user, logout, refreshUser } = useAuth();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleUpdateFirstName = useCallback(
    async (value: string) => {
      await updateProfile({ firstName: value });
      await refreshUser();
    },
    [refreshUser],
  );

  const handleUpdateLastName = useCallback(
    async (value: string) => {
      await updateProfile({ lastName: value });
      await refreshUser();
    },
    [refreshUser],
  );

  const handleExportData = useCallback(async () => {
    setIsExporting(true);
    try {
      const data = await exportUserData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `beyond-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  }, []);

  if (!user) {
    return null;
  }

  const memberSince = formatDate(user.createdAt);

  return (
    <AppShell requireAuth>
      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="font-serif-brand text-3xl text-navy-deep mb-8">{t('title')}</h1>

        {/* Profile Header */}
        <ProfileHeader
          firstName={user.firstName}
          lastName={user.lastName}
          email={user.email}
          avatarUrl={user.avatarUrl}
          memberSince={memberSince}
        />

        {/* Personal Information */}
        <ProfileSection title={t('sections.personal')} className="mt-8">
          <ProfileField
            label={t('fields.firstName')}
            value={user.firstName || ''}
            onEdit={handleUpdateFirstName}
          />
          <ProfileField
            label={t('fields.lastName')}
            value={user.lastName || ''}
            onEdit={handleUpdateLastName}
          />
          <ProfileField label={t('fields.email')} value={user.email} />
        </ProfileSection>

        {/* Security */}
        <ProfileSection title={t('sections.security')} className="mt-8">
          <ProfileField
            label={t('fields.password')}
            value="••••••••••••"
            masked
            actionLabel={t('actions.edit')}
            onAction={() => setShowChangePassword(true)}
          />
          <ProfileField
            label={t('fields.twoFactor')}
            value={user.hasTotpEnabled ? t('actions.enabled') : t('actions.disabled')}
            actionLabel={user.hasTotpEnabled ? t('actions.edit') : t('actions.enable')}
            onAction={() => {
              /* TODO: Implement 2FA setup */
            }}
          />
        </ProfileSection>

        {/* My Data */}
        <ProfileSection title={t('sections.data')} className="mt-8">
          <div className="px-6 py-4">
            <p className="text-sm text-slate mb-4">{t('exportData.description')}</p>
            <button
              onClick={handleExportData}
              disabled={isExporting}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-navy-deep bg-warm-gray hover:bg-warm-gray/80 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              {isExporting ? t('actions.exporting') : t('actions.exportData')}
            </button>
          </div>
        </ProfileSection>

        {/* Logout */}
        <button
          onClick={logout}
          className="mt-8 w-full flex items-center justify-center gap-2 px-6 py-4 text-muted-foreground hover:text-foreground rounded-2xl border border-border hover:border-border/80 transition-all"
        >
          <LogOut className="w-5 h-5" />
          {t('actions.logout')}
        </button>

        {/* Danger Zone */}
        <ProfileSection title={t('sections.danger')} className="mt-12">
          <div className="px-6 py-4">
            <button
              onClick={() => setShowDeleteAccount(true)}
              className="text-red-600 hover:text-red-700 transition-colors"
            >
              {t('actions.deleteAccount')}
            </button>
          </div>
        </ProfileSection>
      </div>

      {/* Dialogs */}
      <ChangePasswordDialog
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />
      <DeleteAccountDialog isOpen={showDeleteAccount} onClose={() => setShowDeleteAccount(false)} />
    </AppShell>
  );
}

'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { LogOut } from 'lucide-react';
import { AppShell } from '@/components/layout';
import {
  ProfileHeader,
  ProfileSection,
  ProfileField,
  ChangePasswordDialog,
  DeleteAccountDialog,
} from '@/components/features/profile';
import { useAuth } from '@/hooks/use-auth';
import { updateProfile } from '@/lib/api/users';
import { formatDate } from '@/lib/constants';

export default function ProfilePage() {
  const t = useTranslations('profile');
  const { user, logout, refreshUser } = useAuth();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);

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

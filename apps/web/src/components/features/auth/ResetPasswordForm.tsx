'use client';

import { Link, useRouter } from '@/i18n/navigation';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { resetPassword } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';
import { ErrorAlert, Logo } from '@/components/ui';
import { PasswordStrength } from './PasswordStrength';

export function ResetPasswordForm() {
  const t = useTranslations('auth');
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError(t('resetPassword.invalidToken'));
    }
  }, [token, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError(t('resetPassword.invalidToken'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t('errors.passwordMismatch'));
      return;
    }

    if (newPassword.length < 8) {
      setError(t('errors.weakPassword'));
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword({ token, newPassword });
      setIsSuccess(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(t('resetPassword.invalidToken'));
      } else {
        setError(t('errors.unexpected'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 py-24">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          <div className="text-center space-y-2">
            <Link href="/" className="inline-block">
              <Logo variant="full" className="h-10 mx-auto" />
            </Link>
          </div>

          <div className="bg-card rounded-2xl border border-border/50 shadow-soft p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="font-display text-display-sm text-foreground mb-2">
              {t('resetPassword.successTitle')}
            </h1>
            <p className="text-muted-foreground mb-6">{t('resetPassword.successMessage')}</p>
            <button
              onClick={() => router.push('/login')}
              className="w-full bg-navy-deep text-white rounded-xl px-8 py-4 font-medium shadow-soft transition-all duration-200 ease-out hover:bg-navy-deep/90"
            >
              {t('resetPassword.goToLogin')}
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-24">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block">
            <Logo variant="full" className="h-10 mx-auto" />
          </Link>
          <h1 className="font-display text-display-sm text-foreground">
            {t('resetPassword.title')}
          </h1>
          <p className="text-muted-foreground">{t('resetPassword.subtitle')}</p>
        </div>

        <div className="bg-card rounded-2xl border border-border/50 shadow-soft p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <ErrorAlert message={error} />}

            <div className="space-y-2">
              <label htmlFor="newPassword" className="block text-sm font-medium text-foreground">
                {t('resetPassword.newPassword')}
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-border/60 bg-background px-4 py-3 pr-12 shadow-inner-soft focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-colors duration-200 ease-out"
                  placeholder={t('resetPassword.newPasswordPlaceholder')}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                >
                  {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {newPassword && <PasswordStrength password={newPassword} />}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-foreground"
              >
                {t('resetPassword.confirmPassword')}
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-border/60 bg-background px-4 py-3 pr-12 shadow-inner-soft focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-colors duration-200 ease-out"
                  placeholder={t('resetPassword.confirmPasswordPlaceholder')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                >
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !token}
              className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-xl px-8 py-4 font-medium shadow-soft transition-all duration-200 ease-out hover:shadow-soft-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? t('resetPassword.submitting') : t('resetPassword.submit')}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-foreground hover:text-accent transition-colors duration-200 ease-out font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('resetPassword.backToLogin')}
          </Link>
        </p>
      </div>
    </main>
  );
}

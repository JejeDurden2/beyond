'use client';

import { Link } from '@/i18n/navigation';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Mail } from 'lucide-react';
import { forgotPassword } from '@/lib/api/auth';
import { ErrorAlert, Logo } from '@/components/ui';

export function ForgotPasswordForm() {
  const t = useTranslations('auth');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await forgotPassword({ email });
      setIsSubmitted(true);
    } catch {
      setError(t('errors.unexpected'));
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 py-24">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          <div className="text-center space-y-2">
            <Link href="/" className="inline-block">
              <Logo variant="full" className="h-10 mx-auto" />
            </Link>
          </div>

          <div className="bg-card rounded-2xl border border-border/50 shadow-soft p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-gold-heritage/10 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-gold-heritage" />
            </div>
            <h1 className="font-display text-display-sm text-foreground mb-2">
              {t('forgotPassword.successTitle')}
            </h1>
            <p className="text-muted-foreground mb-6">{t('forgotPassword.successMessage')}</p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-navy-deep hover:text-navy-deep/80 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('forgotPassword.backToLogin')}
            </Link>
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
            {t('forgotPassword.title')}
          </h1>
          <p className="text-muted-foreground">{t('forgotPassword.subtitle')}</p>
        </div>

        <div className="bg-card rounded-2xl border border-border/50 shadow-soft p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <ErrorAlert message={error} />}

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                {t('forgotPassword.email')}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full rounded-xl border border-border/60 bg-background px-4 py-3 shadow-inner-soft focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-colors duration-200 ease-out"
                placeholder={t('forgotPassword.emailPlaceholder')}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-xl px-8 py-4 font-medium shadow-soft transition-all duration-200 ease-out hover:shadow-soft-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? t('forgotPassword.submitting') : t('forgotPassword.submit')}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-foreground hover:text-accent transition-colors duration-200 ease-out font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('forgotPassword.backToLogin')}
          </Link>
        </p>
      </div>
    </main>
  );
}

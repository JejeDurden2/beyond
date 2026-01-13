'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from '@/i18n/navigation';
import { z } from 'zod';
import { getInvitationInfo, acceptInvitation, setToken, ApiError } from '@/lib/api';
import { BeneficiaryWelcome } from '@/components/features/beneficiary';
import { Loader2, Eye, EyeOff } from 'lucide-react';

const acceptInvitationSchema = z
  .object({
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
  });

interface AcceptInvitationPageProps {
  token: string;
}

export function AcceptInvitationPage({ token }: AcceptInvitationPageProps) {
  const t = useTranslations('beneficiary.welcome');
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const {
    data,
    isLoading,
    error: invitationError,
  } = useQuery({
    queryKey: ['invitation-info', token],
    queryFn: () => getInvitationInfo(token),
  });

  const acceptMutation = useMutation({
    mutationFn: acceptInvitation,
    onSuccess: (response) => {
      setToken(response.accessToken);
      router.push('/portal');
    },
    onError: (err: unknown) => {
      if (
        err instanceof ApiError &&
        err.data &&
        typeof err.data === 'object' &&
        'message' in err.data
      ) {
        setError(String((err.data as { message: string }).message));
      } else {
        setError(t('errors.acceptFailed'));
      }
    },
  });

  useEffect(() => {
    if (data) {
      setFirstName(data.beneficiary.firstName);
      setLastName(data.beneficiary.lastName);
    }
  }, [data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const result = acceptInvitationSchema.safeParse({ password, confirmPassword });
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      if (firstIssue.path[0] === 'password') {
        setError(t('errors.passwordTooShort'));
      } else if (firstIssue.path[0] === 'confirmPassword') {
        setError(t('errors.passwordMismatch'));
      }
      return;
    }

    acceptMutation.mutate({
      token,
      password,
      firstName: firstName.trim() || undefined,
      lastName: lastName.trim() || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-gold-heritage animate-spin mx-auto mb-4" />
          <p className="text-slate">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (invitationError || !data) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <p className="text-red-600 mb-4">{t('errors.invitationNotFound')}</p>
        </div>
      </div>
    );
  }

  if (!showForm) {
    return (
      <div onClick={() => setShowForm(true)} className="cursor-pointer">
        <BeneficiaryWelcome senderName={data.sender.name} keepsakeCount={1} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div
          className="bg-warm-gray rounded-2xl p-6 md:p-8"
          style={{
            boxShadow: `
              0 25px 50px -12px rgba(26, 54, 93, 0.1),
              0 0 0 1px rgba(184, 134, 11, 0.05)
            `,
          }}
        >
          <h1 className="font-serif-brand text-display-sm text-navy-deep text-center mb-6">
            {t('createAccount')}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email (read-only) */}
            <div>
              <label className="block text-sm font-medium text-navy-deep mb-2">
                {t('form.email')}
              </label>
              <input
                type="email"
                value={data.beneficiary.email}
                disabled
                className="w-full px-4 py-3 bg-cream border border-navy-deep/10 rounded-xl text-slate"
              />
            </div>

            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-navy-deep mb-2">
                {t('form.firstName')}
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-3 bg-cream border border-navy-deep/10 rounded-xl focus:border-gold-heritage focus:outline-none"
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-navy-deep mb-2">
                {t('form.lastName')}
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-3 bg-cream border border-navy-deep/10 rounded-xl focus:border-gold-heritage focus:outline-none"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-navy-deep mb-2">
                {t('form.password')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full px-4 py-3 bg-cream border border-navy-deep/10 rounded-xl focus:border-gold-heritage focus:outline-none pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate hover:text-navy-deep"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-navy-deep mb-2">
                {t('form.confirmPassword')}
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-3 bg-cream border border-navy-deep/10 rounded-xl focus:border-gold-heritage focus:outline-none"
              />
            </div>

            {/* Error message */}
            {error && <p className="text-red-600 text-sm">{error}</p>}

            {/* Submit button */}
            <button
              type="submit"
              disabled={acceptMutation.isPending}
              className="w-full py-3 px-6 bg-gold-heritage text-cream rounded-xl font-medium hover:bg-gold-soft transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {acceptMutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('form.submitting')}
                </span>
              ) : (
                t('cta')
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import { useCreateBeneficiary } from '@/hooks/use-beneficiaries';
import { ErrorAlert } from '@/components/ui';
import { RELATIONSHIPS, type Relationship, type Beneficiary } from '@/types';

interface QuickAddBeneficiaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (beneficiary: Beneficiary) => void;
}

export function QuickAddBeneficiaryModal({
  isOpen,
  onClose,
  onSuccess,
}: QuickAddBeneficiaryModalProps): React.ReactElement | null {
  const t = useTranslations('beneficiaries');
  const tCommon = useTranslations('common');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [relationship, setRelationship] = useState<Relationship>('OTHER');
  const [error, setError] = useState<string | null>(null);

  const createBeneficiary = useCreateBeneficiary();

  const resetForm = (): void => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setRelationship('OTHER');
    setError(null);
  };

  const handleClose = (): void => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);

    try {
      const beneficiary = await createBeneficiary.mutateAsync({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        relationship,
      });
      resetForm();
      onSuccess(beneficiary);
    } catch (err) {
      const message = err instanceof Error ? err.message : tCommon('error');
      if (message.includes('email already exists')) {
        setError(t('errors.emailExists'));
      } else {
        setError(message);
      }
    }
  };

  const isValid = firstName.trim() && lastName.trim() && email.trim();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-navy-deep/30 backdrop-blur-sm flex items-center justify-center p-6 z-50">
      <div className="relative rounded-2xl overflow-hidden shadow-xl w-full max-w-md animate-slide-up">
        {/* Glass background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/80 via-gray-50/60 to-white/40" />
        <div className="absolute inset-0 bg-white/50 backdrop-blur-md" />
        <div className="absolute inset-0 rounded-2xl border border-white/60" />

        <div className="relative">
          <div className="flex items-center justify-between p-6 border-b border-white/40">
            <div>
              <h2 className="font-display text-lg text-foreground">{t('quickAdd.title')}</h2>
              <p className="text-sm text-muted-foreground mt-0.5">{t('quickAdd.subtitle')}</p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors duration-200 ease-out"
              aria-label={tCommon('close')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && <ErrorAlert message={error} />}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label
                  htmlFor="quickadd-firstName"
                  className="block text-sm font-medium text-foreground"
                >
                  {t('form.firstName')}
                </label>
                <input
                  id="quickadd-firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-border/60 bg-background px-3 py-2.5 text-sm shadow-inner-soft focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-colors duration-200 ease-out"
                  placeholder={t('form.firstNamePlaceholder')}
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="quickadd-lastName"
                  className="block text-sm font-medium text-foreground"
                >
                  {t('form.lastName')}
                </label>
                <input
                  id="quickadd-lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-border/60 bg-background px-3 py-2.5 text-sm shadow-inner-soft focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-colors duration-200 ease-out"
                  placeholder={t('form.lastNamePlaceholder')}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="quickadd-email" className="block text-sm font-medium text-foreground">
                {t('form.email')}
              </label>
              <input
                id="quickadd-email"
                name="email"
                type="email"
                autoComplete="email"
                spellCheck={false}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-border/60 bg-background px-3 py-2.5 text-sm shadow-inner-soft focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-colors duration-200 ease-out"
                placeholder={t('form.emailPlaceholder')}
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="quickadd-relationship"
                className="block text-sm font-medium text-foreground"
              >
                {t('form.relationship')}
              </label>
              <select
                id="quickadd-relationship"
                name="relationship"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value as Relationship)}
                className="w-full rounded-xl border border-border/60 bg-background px-3 py-2.5 text-sm shadow-inner-soft focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-colors duration-200 ease-out"
              >
                {RELATIONSHIPS.map((rel) => (
                  <option key={rel} value={rel}>
                    {t(`relationships.${rel}`)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="border border-border/60 text-foreground rounded-xl px-4 py-2.5 text-sm font-medium transition-colors duration-200 ease-out hover:bg-muted/50"
              >
                {tCommon('cancel')}
              </button>
              <button
                type="submit"
                disabled={createBeneficiary.isPending || !isValid}
                className="bg-gold-heritage text-cream hover:bg-gold-soft rounded-xl px-4 py-2.5 text-sm font-medium shadow-soft transition-all duration-200 ease-out hover:shadow-soft-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createBeneficiary.isPending ? t('form.creating') : t('form.create')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

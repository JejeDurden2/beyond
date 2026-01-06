'use client';

import { Link, useRouter } from '@/i18n/navigation';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { AppShell } from '@/components/layout';
import { ErrorAlert } from '@/components/ui';
import { useCreateBeneficiary } from '@/hooks/use-beneficiaries';
import { RELATIONSHIPS, type Relationship } from '@/types';

export default function NewBeneficiaryPage() {
  const router = useRouter();
  const t = useTranslations('beneficiaries');
  const tCommon = useTranslations('common');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [relationship, setRelationship] = useState<Relationship>('OTHER');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const createBeneficiary = useCreateBeneficiary();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await createBeneficiary.mutateAsync({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        relationship,
        note: note.trim() || undefined,
      });
      router.push('/beneficiaries');
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

  return (
    <AppShell requireAuth>
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-8">
          <Link
            href="/beneficiaries"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 ease-out inline-flex items-center gap-1"
          >
            ← {tCommon('back')}
          </Link>
        </div>

        <div className="space-y-8 animate-fade-in">
          <div className="text-center space-y-2">
            <h1 className="font-display text-display-sm text-foreground">{t('new')}</h1>
          </div>

          <div className="bg-card rounded-2xl border border-border/50 shadow-soft p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && <ErrorAlert message={error} />}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="block text-sm font-medium text-foreground">
                    {t('form.firstName')}
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full rounded-xl border border-border/60 bg-background px-4 py-3 shadow-inner-soft focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-colors duration-200 ease-out"
                    placeholder={t('form.firstNamePlaceholder')}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="lastName" className="block text-sm font-medium text-foreground">
                    {t('form.lastName')}
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="w-full rounded-xl border border-border/60 bg-background px-4 py-3 shadow-inner-soft focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-colors duration-200 ease-out"
                    placeholder={t('form.lastNamePlaceholder')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-foreground">
                  {t('form.email')}
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-border/60 bg-background px-4 py-3 shadow-inner-soft focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-colors duration-200 ease-out"
                  placeholder={t('form.emailPlaceholder')}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="relationship" className="block text-sm font-medium text-foreground">
                  {t('form.relationship')}
                </label>
                <select
                  id="relationship"
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value as Relationship)}
                  className="w-full rounded-xl border border-border/60 bg-background px-4 py-3 shadow-inner-soft focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-colors duration-200 ease-out"
                >
                  {RELATIONSHIPS.map((rel) => (
                    <option key={rel} value={rel}>
                      {t(`relationships.${rel}`)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="note" className="block text-sm font-medium text-foreground">
                  {t('form.note')}{' '}
                  <span className="text-muted-foreground font-normal">
                    ({t('form.optional') || 'optional'})
                  </span>
                </label>
                <textarea
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-border/60 bg-background px-4 py-3 shadow-inner-soft focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-colors duration-200 ease-out resize-none"
                  placeholder={t('form.notePlaceholder')}
                />
              </div>

              <div className="flex gap-4 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => router.push('/beneficiaries')}
                  className="border border-border/60 text-foreground rounded-xl px-6 py-3 font-medium transition-colors duration-200 ease-out hover:bg-muted/50"
                >
                  {tCommon('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={createBeneficiary.isPending || !isValid}
                  className="bg-foreground text-background hover:bg-foreground/90 rounded-xl px-6 py-3 font-medium shadow-soft transition-all duration-200 ease-out hover:shadow-soft-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createBeneficiary.isPending ? t('form.creating') : t('form.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

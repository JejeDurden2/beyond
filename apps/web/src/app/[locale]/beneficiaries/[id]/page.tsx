'use client';

import { Link, useRouter } from '@/i18n/navigation';
import { useState, useEffect, use } from 'react';
import { useTranslations } from 'next-intl';
import { AppShell } from '@/components/layout';
import { ErrorAlert, ArrowLeft } from '@/components/ui';
import {
  useBeneficiary,
  useUpdateBeneficiary,
  useDeleteBeneficiary,
} from '@/hooks/use-beneficiaries';
import { RELATIONSHIPS, type Relationship } from '@/types';

interface PageParams {
  params: Promise<{ id: string }>;
}

export default function EditBeneficiaryPage({ params }: PageParams) {
  const { id } = use(params);
  const router = useRouter();
  const t = useTranslations('beneficiaries');
  const tCommon = useTranslations('common');

  const { data: beneficiary, isLoading: isLoadingBeneficiary } = useBeneficiary(id);
  const updateBeneficiary = useUpdateBeneficiary();
  const deleteBeneficiary = useDeleteBeneficiary();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [relationship, setRelationship] = useState<Relationship>('OTHER');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (beneficiary) {
      setFirstName(beneficiary.firstName);
      setLastName(beneficiary.lastName);
      setEmail(beneficiary.email);
      setRelationship(beneficiary.relationship);
      setNote(beneficiary.note || '');
    }
  }, [beneficiary]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await updateBeneficiary.mutateAsync({
        id,
        input: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim().toLowerCase(),
          relationship,
          note: note.trim() || null,
        },
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

  const handleDelete = async () => {
    try {
      await deleteBeneficiary.mutateAsync(id);
      router.push('/beneficiaries');
    } catch {
      setError(tCommon('error'));
    }
  };

  const isValid = firstName.trim() && lastName.trim() && email.trim();

  if (isLoadingBeneficiary) {
    return (
      <AppShell requireAuth>
        <div className="max-w-2xl mx-auto px-6 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-8 w-48 bg-muted rounded" />
            <div className="bg-card rounded-2xl border border-border/50 p-8 space-y-6">
              <div className="h-12 bg-muted rounded-xl" />
              <div className="h-12 bg-muted rounded-xl" />
              <div className="h-12 bg-muted rounded-xl" />
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!beneficiary) {
    return (
      <AppShell requireAuth>
        <div className="max-w-2xl mx-auto px-6 py-12 text-center">
          <h1 className="font-display text-display-sm text-foreground">{t('notFound.title')}</h1>
          <Link
            href="/beneficiaries"
            className="text-sm text-muted-foreground hover:text-foreground mt-4 inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" /> {t('notFound.back')}
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell requireAuth>
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-8">
          <Link
            href="/beneficiaries"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 ease-out inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" /> {tCommon('back')}
          </Link>
        </div>

        <div className="space-y-8 animate-fade-in">
          <div className="text-center space-y-2">
            <h1 className="font-display text-display-sm text-foreground">{t('editTitle')}</h1>
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
                  <span className="text-muted-foreground font-normal">({t('form.optional')})</span>
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
                  disabled={updateBeneficiary.isPending || !isValid}
                  className="bg-foreground text-background hover:bg-foreground/90 rounded-xl px-6 py-3 font-medium shadow-soft transition-all duration-200 ease-out hover:shadow-soft-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateBeneficiary.isPending ? t('form.saving') : t('form.save')}
                </button>
              </div>
            </form>
          </div>

          <div className="bg-card rounded-2xl border border-destructive/20 shadow-soft p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-foreground">{t('delete.button')}</h3>
                <p className="text-sm text-muted-foreground mt-1">{t('delete.description')}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-destructive hover:text-destructive/80 font-medium text-sm"
              >
                {tCommon('delete')}
              </button>
            </div>
          </div>
        </div>

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-2xl border border-border/50 shadow-soft-lg p-6 max-w-md w-full animate-fade-in">
              <h3 className="font-display text-xl text-foreground">{t('delete.title')}</h3>
              <p className="text-muted-foreground mt-2">{t('delete.description')}</p>
              <div className="flex gap-3 justify-end mt-6">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="border border-border/60 text-foreground rounded-xl px-4 py-2 font-medium text-sm transition-colors hover:bg-muted/50"
                >
                  {tCommon('cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteBeneficiary.isPending}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl px-4 py-2 font-medium text-sm transition-colors disabled:opacity-50"
                >
                  {deleteBeneficiary.isPending ? t('delete.deleting') : t('delete.confirm')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { AlertTriangle, Shield, CheckCircle, Loader2, Heart } from 'lucide-react';

interface LinkedVault {
  vaultId: string;
  vaultOwnerName: string;
  isTrustedPersonFor: boolean;
  deathDeclared: boolean;
  deathDeclaredAt?: string;
}

interface DeathDeclarationPanelProps {
  linkedVaults: LinkedVault[];
  onDeclareDeath: (vaultId: string) => Promise<void>;
}

export function DeathDeclarationPanel({
  linkedVaults,
  onDeclareDeath,
}: DeathDeclarationPanelProps) {
  const t = useTranslations('beneficiary.deathDeclaration');
  const [confirmingVaultId, setConfirmingVaultId] = useState<string | null>(null);
  const [declaringVaultId, setDeclaringVaultId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Only show vaults where user is trusted person
  const trustedVaults = linkedVaults.filter((v) => v.isTrustedPersonFor);

  if (trustedVaults.length === 0) {
    return null;
  }

  async function handleConfirmDeclaration(vaultId: string): Promise<void> {
    setDeclaringVaultId(vaultId);
    setError(null);
    try {
      await onDeclareDeath(vaultId);
      setConfirmingVaultId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.unknown'));
    } finally {
      setDeclaringVaultId(null);
    }
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <div className="bg-warm-gray rounded-2xl p-4 md:p-6 mb-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-navy-deep/10 flex items-center justify-center flex-shrink-0">
          <Shield className="w-5 h-5 text-navy-deep" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-serif-brand text-lg md:text-xl text-navy-deep">{t('panel.title')}</h2>
          <p className="text-sm text-slate mt-1">{t('panel.subtitle')}</p>
        </div>
      </div>

      {/* Vault list */}
      <div className="space-y-4">
        {trustedVaults.map((vault) => (
          <div key={vault.vaultId} className="bg-cream rounded-xl p-4">
            {/* Already declared */}
            {vault.deathDeclared ? (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-slate/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Heart className="w-4 h-4 text-slate" />
                </div>
                <div>
                  <p className="font-medium text-navy-deep">{vault.vaultOwnerName}</p>
                  <p className="text-sm text-slate mt-1">{t('panel.vault.declared')}</p>
                  {vault.deathDeclaredAt && (
                    <p className="text-xs text-slate/70 mt-1">
                      {t('panel.vault.declaredAt', { date: formatDate(vault.deathDeclaredAt) })}
                    </p>
                  )}
                </div>
              </div>
            ) : confirmingVaultId === vault.vaultId ? (
              /* Confirmation state */
              <div>
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium text-navy-deep">
                      {t('panel.confirm.title', { name: vault.vaultOwnerName })}
                    </p>
                    <p className="text-sm text-slate mt-1">{t('panel.confirm.message')}</p>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmingVaultId(null)}
                    disabled={declaringVaultId === vault.vaultId}
                    className="flex-1 px-4 py-2.5 text-sm text-slate hover:text-navy-deep border border-border rounded-xl transition-colors disabled:opacity-50"
                  >
                    {t('panel.confirm.cancel')}
                  </button>
                  <button
                    onClick={() => handleConfirmDeclaration(vault.vaultId)}
                    disabled={declaringVaultId === vault.vaultId}
                    className="flex-1 px-4 py-2.5 text-sm bg-navy-deep text-white rounded-xl hover:bg-navy-deep/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {declaringVaultId === vault.vaultId ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {t('panel.confirm.declaring')}
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        {t('panel.confirm.confirmButton')}
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* Initial state - show declare button */
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 rounded-full bg-gold-heritage/10 flex items-center justify-center flex-shrink-0">
                    <Heart className="w-4 h-4 text-gold-heritage" />
                  </div>
                  <div>
                    <p className="font-medium text-navy-deep">{vault.vaultOwnerName}</p>
                    <p className="text-sm text-slate">{t('panel.vault.active')}</p>
                  </div>
                </div>
                <button
                  onClick={() => setConfirmingVaultId(vault.vaultId)}
                  className="px-4 py-2 text-sm border-2 border-navy-deep text-navy-deep rounded-xl hover:bg-navy-deep hover:text-white transition-colors"
                >
                  {t('panel.vault.declareButton')}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Info notice */}
      <div className="mt-4 p-3 bg-cream rounded-xl border border-border">
        <p className="text-xs text-slate">{t('panel.notice')}</p>
      </div>
    </div>
  );
}

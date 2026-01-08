'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { X, AlertTriangle } from 'lucide-react';
import { deleteAccount } from '@/lib/api/users';
import { useAuth } from '@/hooks/use-auth';

interface DeleteAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteAccountDialog({ isOpen, onClose }: DeleteAccountDialogProps) {
  const t = useTranslations('profile.deleteAccount');
  const { logout } = useAuth();
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = useCallback(async () => {
    if (confirmText !== 'SUPPRIMER') return;

    setIsDeleting(true);
    try {
      await deleteAccount();
      logout();
    } catch (error) {
      console.error('Failed to delete account:', error);
    } finally {
      setIsDeleting(false);
    }
  }, [confirmText, logout]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-navy-deep/40 backdrop-blur-sm cursor-default"
        onClick={onClose}
        aria-label="Close"
      />

      {/* Dialog */}
      <div className="relative w-full max-w-md bg-background rounded-2xl shadow-soft-lg p-6 animate-[fadeIn_0.2s_ease-out]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-xl font-medium text-foreground">{t('title')}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-muted-foreground mb-6">{t('warning')}</p>

        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-2">
            {t('confirmLabel')}
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="SUPPRIMER"
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
          />
        </div>

        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 text-muted-foreground hover:text-foreground rounded-xl border border-border hover:border-border/80 transition-all"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleDelete}
            disabled={confirmText !== 'SUPPRIMER' || isDeleting}
            className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-medium transition-all duration-200 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? '...' : t('confirm')}
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}

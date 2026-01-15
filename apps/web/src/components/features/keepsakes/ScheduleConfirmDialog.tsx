'use client';

import { useTranslations, useLocale } from 'next-intl';
import { X, AlertTriangle, Calendar, Heart, Send } from 'lucide-react';
import type { TriggerCondition } from '@/types';
import { formatDate } from '@/lib/constants';

interface ScheduleConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  triggerCondition: TriggerCondition;
  scheduledAt: string | null;
  recipientCount: number;
  isLoading?: boolean;
}

export function ScheduleConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  triggerCondition,
  scheduledAt,
  recipientCount,
  isLoading = false,
}: ScheduleConfirmDialogProps): React.ReactElement | null {
  const t = useTranslations('keepsakes.schedule');
  const locale = useLocale();

  if (!isOpen) return null;

  const getIcon = (): React.ReactNode => {
    switch (triggerCondition) {
      case 'on_death':
        return <Heart className="h-6 w-6 text-gold-heritage" />;
      case 'on_date':
        return <Calendar className="h-6 w-6 text-gold-heritage" />;
      case 'manual':
        return <Send className="h-6 w-6 text-amber-600" />;
    }
  };

  const getMessage = (): string => {
    switch (triggerCondition) {
      case 'on_death':
        return t('confirmOnDeath', { count: recipientCount });
      case 'on_date':
        return t('confirmOnDate', {
          count: recipientCount,
          date: scheduledAt ? formatDate(scheduledAt, locale) : '',
        });
      case 'manual':
        return t('confirmManual', { count: recipientCount });
    }
  };

  const isManual = triggerCondition === 'manual';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-navy-deep/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label={t('cancelButton')}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-md rounded-2xl bg-card p-6 shadow-xl">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          aria-label={t('cancelButton')}
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="space-y-4">
          {/* Icon */}
          <div
            className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${
              isManual ? 'bg-amber-100' : 'bg-gold-heritage/10'
            }`}
          >
            {getIcon()}
          </div>

          {/* Title */}
          <h2 className="text-center font-serif-brand text-xl text-navy-deep">
            {t('confirmTitle')}
          </h2>

          {/* Message */}
          <p className="text-center text-muted-foreground">{getMessage()}</p>

          {/* Warning for manual delivery */}
          {isManual && (
            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-600" />
              <p className="text-sm text-amber-800">{t('manualWarning')}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 rounded-xl border border-border px-4 py-2.5 font-medium text-foreground transition-colors hover:bg-muted/50 disabled:opacity-50"
            >
              {t('cancelButton')}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 rounded-xl px-4 py-2.5 font-medium text-cream transition-colors disabled:opacity-50 ${
                isManual ? 'bg-amber-600 hover:bg-amber-700' : 'bg-gold-heritage hover:bg-gold-soft'
              }`}
            >
              {isLoading ? '...' : t('confirmButton')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

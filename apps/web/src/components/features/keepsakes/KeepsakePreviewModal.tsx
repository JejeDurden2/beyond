'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { X, Eye, ChevronRight } from 'lucide-react';
import type { KeepsakeType } from '@/types';

interface KeepsakePreviewModalProps {
  isOpen: boolean;
  type: KeepsakeType;
  title: string;
  content: string;
  recipientName: string;
  personalMessage?: string;
  onClose: () => void;
  onConfirm?: () => void;
  confirmLabel?: string;
  isLoading?: boolean;
}

export function KeepsakePreviewModal({
  isOpen,
  type,
  title,
  content,
  recipientName,
  personalMessage,
  onClose,
  onConfirm,
  confirmLabel,
  isLoading,
}: KeepsakePreviewModalProps): React.ReactElement | null {
  const t = useTranslations('keepsakes.form');
  const tViz = useTranslations('keepsakes.visualization');
  const tCommon = useTranslations('common');

  const [showPersonalMessage, setShowPersonalMessage] = useState(true);

  // Reset personal message display when modal opens
  useEffect(() => {
    if (isOpen && personalMessage) {
      setShowPersonalMessage(true);
    }
  }, [isOpen, personalMessage]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const renderContent = (): React.ReactElement => {
    switch (type) {
      case 'letter':
        return (
          <div
            className="relative rounded-sm overflow-y-auto max-h-[70vh]"
            style={{
              background: 'linear-gradient(180deg, #FDF8F0 0%, #FDFAF5 100%)',
              boxShadow: `
                0 25px 50px -12px rgba(26, 54, 93, 0.15),
                0 0 0 1px rgba(184, 134, 11, 0.1),
                inset 0 1px 0 0 rgba(255, 255, 255, 0.5)
              `,
            }}
          >
            <div className="hidden md:block absolute top-0 bottom-0 left-16 lg:left-20 w-px bg-red-300/30" />
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.03]"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(transparent, transparent 31px, #1a365d 31px, #1a365d 32px)',
                backgroundPosition: '0 44px',
              }}
            />
            <div className="px-6 py-8 md:px-8 md:py-12 md:pl-20 lg:px-12 lg:pl-24">
              <div className="text-sm text-navy-deep/50 mb-6 md:mb-8 italic">{title}</div>
              <div
                className="font-serif-brand text-base md:text-lg lg:text-xl text-navy-deep/85 leading-[1.9] md:leading-[2.2] whitespace-pre-wrap"
                style={{ fontStyle: 'italic' }}
              >
                {content.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="mb-6 md:mb-8 last:mb-0">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
        );

      case 'wish':
        return (
          <div className="bg-gradient-to-br from-rose-50 to-amber-50 rounded-2xl p-8 md:p-12 shadow-soft-lg">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-rose-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-rose-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
              <h3 className="font-display text-xl text-navy-deep mb-4">{title}</h3>
              <p className="text-navy-deep/80 text-lg leading-relaxed whitespace-pre-wrap">
                {content}
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-card rounded-2xl p-8 shadow-soft-lg text-center">
            <h3 className="font-display text-xl text-foreground mb-4">{title}</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{content}</p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-navy-deep/30 backdrop-blur-sm cursor-default animate-fade-in"
        onClick={onClose}
        aria-label={tCommon('close')}
      />

      {/* Content container */}
      <div className="relative w-full max-w-2xl z-10 animate-slide-up">
        {/* Personal message overlay */}
        {personalMessage && showPersonalMessage && (
          <div className="mb-4 bg-card rounded-2xl border border-border/50 shadow-soft-lg p-6 animate-fade-in">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Eye className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  {t('previewSubtitle', { name: recipientName })}
                </p>
                <p className="text-foreground italic">&ldquo;{personalMessage}&rdquo;</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowPersonalMessage(false)}
              className="mt-4 w-full flex items-center justify-center gap-2 py-2 text-sm text-accent hover:text-accent/80 transition-colors duration-200 ease-out"
            >
              {tViz('view')}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Keepsake content */}
        {(!personalMessage || !showPersonalMessage) && (
          <>
            {/* Header bar */}
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2 text-sm text-white/80">
                <Eye className="w-4 h-4" />
                <span>{t('previewSubtitle', { name: recipientName })}</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors duration-200 ease-out"
                aria-label={tCommon('close')}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Keepsake visualization */}
            {renderContent()}

            {/* Action buttons */}
            {onConfirm && (
              <div className="flex gap-3 justify-end mt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-white/10 text-white hover:bg-white/20 font-medium transition-colors duration-200 ease-out"
                >
                  {tCommon('back')}
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-xl bg-gold-heritage text-cream hover:bg-gold-soft font-medium shadow-soft transition-all duration-200 ease-out hover:shadow-soft-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? tCommon('loading') : confirmLabel || t('confirmAndCreate')}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

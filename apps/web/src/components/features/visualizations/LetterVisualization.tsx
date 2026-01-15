'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Pencil, X, Eye, ChevronRight } from 'lucide-react';

interface LetterVisualizationProps {
  title: string;
  content: string;
  recipientName?: string;
  personalMessage?: string;
  onEdit?: () => void;
  onClose: () => void;
}

export function LetterVisualization({
  title,
  content,
  recipientName,
  personalMessage,
  onEdit,
  onClose,
}: LetterVisualizationProps): React.ReactElement {
  const t = useTranslations('keepsakes.visualization');
  const tForm = useTranslations('keepsakes.form');

  const [showPersonalMessage, setShowPersonalMessage] = useState(!!personalMessage);

  // Show personal message overlay first if available
  if (personalMessage && showPersonalMessage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
        {/* Backdrop */}
        <button
          type="button"
          className="absolute inset-0 bg-navy-deep/30 backdrop-blur-sm cursor-default animate-fade-in"
          onClick={onClose}
          aria-label={t('close')}
        />

        {/* Personal message card */}
        <div className="relative z-10 w-full max-w-lg animate-slide-up">
          <div className="bg-card rounded-2xl border border-border/50 shadow-soft-lg p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Eye className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  {tForm('previewSubtitle', { name: recipientName || '' })}
                </p>
                <p className="text-foreground italic">&ldquo;{personalMessage}&rdquo;</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                aria-label={t('close')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => setShowPersonalMessage(false)}
              className="mt-4 w-full flex items-center justify-center gap-2 py-2 text-sm text-accent hover:text-accent/80 transition-colors duration-200 ease-out"
            >
              {t('view')}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-navy-deep/30 backdrop-blur-sm cursor-default"
        style={{ animation: 'fadeIn 0.8s ease-out' }}
        onClick={onClose}
        aria-label={t('close')}
      />

      {/* Letter container with envelope opening effect */}
      <div
        className="relative w-full max-w-2xl max-h-[85vh] overflow-hidden"
        style={{ animation: 'letterUnfold 1.8s cubic-bezier(0.22, 1, 0.36, 1)' }}
      >
        {/* Paper with warm cream and subtle shadow */}
        <div
          className="relative rounded-sm overflow-y-auto max-h-[85vh]"
          style={{
            background: 'linear-gradient(180deg, #FDF8F0 0%, #FDFAF5 100%)',
            boxShadow: `
              0 25px 50px -12px rgba(26, 54, 93, 0.15),
              0 0 0 1px rgba(184, 134, 11, 0.1),
              inset 0 1px 0 0 rgba(255, 255, 255, 0.5)
            `,
          }}
        >
          {/* Left margin line (like ruled paper) - hidden on mobile for more space */}
          <div
            className="hidden md:block absolute top-0 bottom-0 left-16 lg:left-20 w-px bg-red-300/30"
            style={{ animation: 'fadeIn 1.5s ease-out 0.5s both' }}
          />

          {/* Horizontal rules (subtle) */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage:
                'repeating-linear-gradient(transparent, transparent 31px, #1a365d 31px, #1a365d 32px)',
              backgroundPosition: '0 44px',
            }}
          />

          {/* Actions */}
          <div className="sticky top-0 z-10 flex justify-end gap-2 p-4 bg-gradient-to-b from-[#FDF8F0] to-transparent">
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="p-2 rounded-full bg-warm-gray/80 text-navy-deep hover:bg-gold-soft/30 transition-colors duration-300"
                aria-label={t('edit')}
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full bg-warm-gray/80 text-navy-deep hover:bg-red-100 transition-colors duration-300"
              aria-label={t('close')}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 pb-12 pt-4 md:px-8 md:pb-16 md:pl-20 lg:px-12 lg:pb-20 lg:pl-24">
            {/* Date-like header */}
            <div
              className="text-sm text-navy-deep/50 mb-6 md:mb-8 italic"
              style={{ animation: 'textSlideIn 1.5s ease-out 0.6s both' }}
            >
              {title}
            </div>

            {/* Letter body in italic serif */}
            <div
              className="font-serif-brand text-base md:text-lg lg:text-xl text-navy-deep/85 leading-[1.9] md:leading-[2.2] whitespace-pre-wrap"
              style={{
                fontStyle: 'italic',
                animation: 'textSlideIn 1.5s ease-out 0.9s both',
              }}
            >
              {content.split('\n\n').map((paragraph, index) => (
                <p key={index} className="mb-6 md:mb-8 last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Sign-off flourish */}
            <div
              className="mt-10 md:mt-16 flex justify-end"
              style={{ animation: 'textSlideIn 1.5s ease-out 1.2s both' }}
            >
              <div className="text-right">
                <div className="w-24 h-px bg-gradient-to-r from-transparent via-gold-heritage/40 to-transparent mb-4" />
                <svg
                  viewBox="0 0 100 40"
                  className="w-20 h-8 text-gold-heritage/60"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                >
                  <path d="M 10 30 Q 30 10, 50 25 T 90 20" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes letterUnfold {
          0% {
            opacity: 0;
            transform: perspective(1000px) rotateX(-20deg) scale(0.9);
          }
          40% {
            opacity: 1;
            transform: perspective(1000px) rotateX(-5deg) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: perspective(1000px) rotateX(0deg) scale(1);
          }
        }

        @keyframes textSlideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}

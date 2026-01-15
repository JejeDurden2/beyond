'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Pencil, X, Eye, ChevronRight } from 'lucide-react';

interface WishVisualizationProps {
  title: string;
  content: string;
  recipientName?: string;
  personalMessage?: string;
  onEdit?: () => void;
  onClose: () => void;
}

export function WishVisualization({
  title,
  content,
  recipientName,
  personalMessage,
  onEdit,
  onClose,
}: WishVisualizationProps): React.ReactElement {
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
      {/* Backdrop with deeper tone */}
      <button
        type="button"
        className="absolute inset-0 bg-navy-deep/50 backdrop-blur-sm cursor-default"
        style={{ animation: 'fadeIn 1s ease-out' }}
        onClick={onClose}
        aria-label={t('close')}
      />

      {/* Document container */}
      <div
        className="relative w-full max-w-2xl max-h-[85vh] overflow-hidden"
        style={{ animation: 'sealReveal 2s cubic-bezier(0.22, 1, 0.36, 1)' }}
      >
        {/* Parchment-like paper */}
        <div
          className="relative rounded-sm overflow-y-auto max-h-[85vh]"
          style={{
            background: `
              linear-gradient(180deg, #F5EFE0 0%, #EDE4D3 50%, #E8DCC8 100%)
            `,
            backgroundImage: `
              url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E"),
              linear-gradient(180deg, #F5EFE0 0%, #EDE4D3 50%, #E8DCC8 100%)
            `,
            boxShadow: `
              0 30px 60px -15px rgba(26, 54, 93, 0.25),
              inset 0 1px 0 0 rgba(255, 255, 255, 0.3),
              inset 0 -1px 0 0 rgba(0, 0, 0, 0.05)
            `,
          }}
        >
          {/* Top border ornament */}
          <div
            className="h-1 w-full bg-gradient-to-r from-transparent via-gold-heritage/60 to-transparent"
            style={{ animation: 'fadeIn 1.5s ease-out 0.5s both' }}
          />

          {/* Actions */}
          <div className="sticky top-0 z-10 flex justify-end gap-2 p-4 bg-gradient-to-b from-[#F5EFE0] to-transparent">
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="p-2 rounded-full bg-[#E8DCC8]/80 text-navy-deep hover:bg-gold-soft/40 transition-colors duration-300"
                aria-label={t('edit')}
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full bg-[#E8DCC8]/80 text-navy-deep hover:bg-red-200/50 transition-colors duration-300"
              aria-label={t('close')}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 pb-12 pt-2 md:px-8 md:pb-16 lg:px-16 lg:pb-20">
            {/* Decorative seal/emblem */}
            <div
              className="flex justify-center mb-8 md:mb-10"
              style={{ animation: 'sealAppear 1.5s ease-out 0.8s both' }}
            >
              <div className="relative">
                <svg viewBox="0 0 80 80" className="w-16 h-16 text-gold-heritage/70">
                  {/* Outer circle */}
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.5"
                  />
                  {/* Inner decorative element - stylized B */}
                  <text
                    x="40"
                    y="48"
                    textAnchor="middle"
                    className="font-serif-brand text-2xl"
                    fill="currentColor"
                  >
                    B
                  </text>
                  {/* Small dots around */}
                  {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                    <circle
                      key={angle}
                      cx={40 + 28 * Math.cos((angle * Math.PI) / 180)}
                      cy={40 + 28 * Math.sin((angle * Math.PI) / 180)}
                      r="1.5"
                      fill="currentColor"
                    />
                  ))}
                </svg>
              </div>
            </div>

            {/* Title in formal centered layout */}
            <h1
              className="font-serif-brand text-lg md:text-xl lg:text-2xl text-navy-deep text-center mb-4 tracking-[0.1em] md:tracking-[0.15em] uppercase"
              style={{ animation: 'textFadeUp 1.5s ease-out 1s both' }}
            >
              {title}
            </h1>

            {/* Decorative divider */}
            <div
              className="flex items-center justify-center gap-3 md:gap-4 mb-8 md:mb-10"
              style={{ animation: 'textFadeUp 1.5s ease-out 1.1s both' }}
            >
              <div className="w-12 h-px bg-navy-deep/20" />
              <svg viewBox="0 0 20 10" className="w-5 h-2.5 text-gold-heritage/60">
                <path d="M 0 5 L 10 0 L 20 5 L 10 10 Z" fill="currentColor" />
              </svg>
              <div className="w-12 h-px bg-navy-deep/20" />
            </div>

            {/* Body text in formal serif */}
            <div
              className="font-serif-brand text-sm md:text-base lg:text-lg text-navy-deep/90 leading-[1.8] md:leading-[2] whitespace-pre-wrap text-center"
              style={{ animation: 'textFadeUp 1.5s ease-out 1.3s both' }}
            >
              {content.split('\n\n').map((paragraph, index) => (
                <p key={index} className="mb-6 last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Bottom signature area */}
            <div
              className="mt-10 md:mt-16 flex flex-col items-center"
              style={{ animation: 'textFadeUp 1.5s ease-out 1.5s both' }}
            >
              <div className="w-32 h-px bg-navy-deep/20 mb-2" />
              <span className="text-xs text-navy-deep/40 uppercase tracking-[0.2em]">Beyond</span>
            </div>
          </div>

          {/* Bottom border ornament */}
          <div
            className="h-1 w-full bg-gradient-to-r from-transparent via-gold-heritage/60 to-transparent"
            style={{ animation: 'fadeIn 1.5s ease-out 0.5s both' }}
          />
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

        @keyframes sealReveal {
          0% {
            opacity: 0;
            transform: scale(0.9) translateY(30px);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.02) translateY(-5px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes sealAppear {
          0% {
            opacity: 0;
            transform: scale(0.5) rotate(-10deg);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
        }

        @keyframes textFadeUp {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

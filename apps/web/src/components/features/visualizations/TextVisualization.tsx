'use client';

import { useTranslations } from 'next-intl';
import { Pencil, X } from 'lucide-react';

interface TextVisualizationProps {
  title: string;
  content: string;
  onEdit: () => void;
  onClose: () => void;
}

export function TextVisualization({ title, content, onEdit, onClose }: TextVisualizationProps) {
  const t = useTranslations('keepsakes.visualization');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
      {/* Backdrop with slow fade */}
      <button
        type="button"
        className="absolute inset-0 bg-navy-deep/40 backdrop-blur-sm animate-[fadeIn_0.8s_ease-out] cursor-default"
        onClick={onClose}
        aria-label={t('close')}
      />

      {/* Paper container */}
      <div
        className="relative w-full max-w-2xl max-h-[85vh] overflow-hidden animate-[paperReveal_1.5s_ease-out]"
        style={{
          animation: 'paperReveal 1.5s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {/* Paper with texture */}
        <div
          className="relative bg-[#FDFBF5] rounded-sm shadow-soft-lg overflow-y-auto max-h-[85vh]"
          style={{
            backgroundImage: `
              radial-gradient(ellipse at 20% 30%, rgba(212, 168, 75, 0.03) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 70%, rgba(26, 54, 93, 0.02) 0%, transparent 50%),
              url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")
            `,
          }}
        >
          {/* Corner marks */}
          <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-navy-deep/10" />
          <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-navy-deep/10" />
          <div className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-navy-deep/10" />
          <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-navy-deep/10" />

          {/* Actions */}
          <div className="sticky top-0 z-10 flex justify-end gap-2 p-4 bg-gradient-to-b from-[#FDFBF5] to-transparent">
            <button
              onClick={onEdit}
              className="p-2 rounded-full bg-warm-gray/80 text-navy-deep hover:bg-gold-soft/30 transition-colors duration-300"
              aria-label={t('edit')}
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-warm-gray/80 text-navy-deep hover:bg-red-100 transition-colors duration-300"
              aria-label={t('close')}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 pb-12 pt-4 md:px-12 md:pb-16 lg:px-20 lg:pb-20">
            {/* Title */}
            <h1
              className="font-serif-brand text-xl md:text-2xl lg:text-3xl text-navy-deep text-center mb-8 md:mb-12 animate-[textFadeIn_2s_ease-out_0.5s_both]"
              style={{ letterSpacing: '0.02em' }}
            >
              {title}
            </h1>

            {/* Body text */}
            <div
              className="font-serif-brand text-base md:text-lg lg:text-xl text-navy-deep/90 leading-[1.8] md:leading-[2] whitespace-pre-wrap animate-[textFadeIn_2s_ease-out_0.8s_both]"
              style={{
                textAlign: 'justify',
                hyphens: 'auto',
                textIndent: '2em',
              }}
            >
              {content.split('\n\n').map((paragraph, index) => (
                <p key={index} className="mb-6 md:mb-8 last:mb-0">
                  {paragraph}
                </p>
              ))}
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

        @keyframes paperReveal {
          0% {
            opacity: 0;
            transform: scale(0.95) translateY(20px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes textFadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
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

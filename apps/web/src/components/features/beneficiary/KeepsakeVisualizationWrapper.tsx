'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Download, Printer, ArrowLeft, X } from 'lucide-react';
import { LetterVisualization } from '@/components/features/visualizations/LetterVisualization';
import { PhotoVisualization } from '@/components/features/visualizations/PhotoVisualization';
import { DocumentVisualization } from '@/components/features/visualizations/DocumentVisualization';
import { WishVisualization } from '@/components/features/visualizations/WishVisualization';

interface KeepsakeVisualizationWrapperProps {
  type: 'letter' | 'photo' | 'document' | 'wish';
  title: string;
  content: string;
  senderName: string;
  deliveredAt: Date;
  trigger?: 'on_death' | 'on_date' | 'manual';
  onDownload?: () => void;
}

export function KeepsakeVisualizationWrapper({
  type,
  title,
  content,
  senderName,
  deliveredAt: _deliveredAt,
  trigger,
  onDownload,
}: KeepsakeVisualizationWrapperProps) {
  const t = useTranslations('beneficiary.visualization');
  const router = useRouter();

  const handleClose = () => {
    router.push('/portal');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      // Default download behavior - create a text file
      const blob = new Blob([`${title}\n\n${content}`], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // Wrapper component that adds beneficiary-specific UI
  const renderVisualization = () => {
    const commonProps = {
      title,
      content,
      // Provide empty handlers - we'll override with our own UI
      onEdit: () => {},
      onClose: handleClose,
    };

    switch (type) {
      case 'letter':
        return <LetterVisualization {...commonProps} />;
      case 'photo':
        return (
          <PhotoVisualization
            {...commonProps}
            media={[
              {
                id: '1',
                keepsakeId: '1',
                type: 'image',
                key: content,
                url: content,
                filename: title,
                mimeType: 'image/jpeg',
                size: 0,
                order: 0,
                createdAt: new Date().toISOString(),
              },
            ]}
          />
        );
      case 'document':
        return (
          <DocumentVisualization
            {...commonProps}
            media={[
              {
                id: '1',
                keepsakeId: '1',
                type: 'document',
                key: content,
                url: content,
                filename: title,
                mimeType: 'application/pdf',
                size: 0,
                order: 0,
                createdAt: new Date().toISOString(),
              },
            ]}
          />
        );
      case 'wish':
        return <WishVisualization {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="relative">
      {/* Custom action bar overlaid on visualization */}
      <div className="fixed top-0 left-0 right-0 z-[60] bg-cream/95 backdrop-blur-sm border-b border-navy-deep/10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Back button */}
            <button
              onClick={handleClose}
              className="flex items-center gap-2 text-sm md:text-base text-navy-deep hover:text-navy-light transition-colors"
            >
              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline">{t('actions.back')}</span>
            </button>

            {/* Delivery info (hidden on mobile) */}
            <div className="hidden md:flex items-center gap-4 text-sm text-slate">
              <span>{t('deliveryInfo.from', { senderName })}</span>
              {trigger && (
                <>
                  <span className="text-gold-heritage">•</span>
                  <span>{t(`deliveryInfo.trigger.${trigger}`)}</span>
                </>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="p-2 rounded-lg bg-warm-gray hover:bg-gold-soft/30 text-navy-deep transition-colors"
                aria-label={t('actions.download')}
                title={t('actions.download')}
              >
                <Download className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              <button
                onClick={handlePrint}
                className="hidden md:block p-2 rounded-lg bg-warm-gray hover:bg-gold-soft/30 text-navy-deep transition-colors"
                aria-label={t('actions.print')}
                title={t('actions.print')}
              >
                <Printer className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg bg-warm-gray hover:bg-red-100 text-navy-deep transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          </div>

          {/* Mobile delivery info */}
          <div className="md:hidden mt-2 pt-2 border-t border-navy-deep/5 text-xs text-slate">
            <p>{t('deliveryInfo.from', { senderName })}</p>
            {trigger && <p className="mt-1">{t(`deliveryInfo.trigger.${trigger}`)}</p>}
          </div>
        </div>
      </div>

      {/* Add top padding to account for fixed header */}
      <div className="pt-16 md:pt-20">{renderVisualization()}</div>

      {/* Print-specific styles */}
      <style jsx global>{`
        @media print {
          .fixed {
            position: relative !important;
          }
          button {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

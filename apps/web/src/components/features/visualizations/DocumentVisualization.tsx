'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import {
  Pencil,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  FileSpreadsheet,
  File,
} from 'lucide-react';
import type { KeepsakeMedia } from '@/types';

interface DocumentVisualizationProps {
  title: string;
  media: KeepsakeMedia[];
  onEdit?: () => void;
  onClose: () => void;
}

function getDocumentIcon(mimeType: string) {
  const isSpreadsheet =
    mimeType === 'application/vnd.ms-excel' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

  if (isSpreadsheet) {
    return FileSpreadsheet;
  }

  const isTextDocument =
    mimeType === 'application/pdf' ||
    mimeType === 'application/msword' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

  if (isTextDocument) {
    return FileText;
  }

  return File;
}

function getDocumentTypeLabel(mimeType: string): string {
  if (mimeType === 'application/pdf') return 'PDF';
  if (mimeType === 'application/msword') return 'Word (.doc)';
  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    return 'Word (.docx)';
  if (mimeType === 'application/vnd.ms-excel') return 'Excel (.xls)';
  if (mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    return 'Excel (.xlsx)';
  return 'Document';
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentVisualization({
  title,
  media,
  onEdit,
  onClose,
}: DocumentVisualizationProps) {
  const t = useTranslations('keepsakes.visualization');
  const [currentIndex, setCurrentIndex] = useState(0);

  const documents = media.filter((m) => m.type === 'document' || m.type === 'image');
  const currentDoc = documents[currentIndex];
  const hasMultiple = documents.length > 1;

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? documents.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === documents.length - 1 ? 0 : prev + 1));
  };

  const handleDownload = () => {
    if (currentDoc?.url) {
      window.open(currentDoc.url, '_blank');
    }
  };

  if (documents.length === 0) {
    onEdit?.();
    return null;
  }

  const isImage = currentDoc?.type === 'image';
  const isPdf = currentDoc?.mimeType === 'application/pdf';
  const DocIcon = currentDoc ? getDocumentIcon(currentDoc.mimeType) : File;

  function renderDocumentPreview() {
    if (isImage && currentDoc?.url) {
      return (
        <div className="relative">
          <Image
            src={currentDoc.url}
            alt={currentDoc.filename}
            width={800}
            height={600}
            className="max-h-[60vh] md:max-h-[70vh] w-auto object-contain"
            unoptimized
          />
        </div>
      );
    }

    if (isPdf && currentDoc?.url) {
      return (
        <div className="w-[90vw] md:w-[70vw] lg:w-[60vw] h-[60vh] md:h-[70vh]">
          <iframe
            src={`${currentDoc.url}#view=FitH`}
            className="w-full h-full border-0"
            title={currentDoc.filename}
          />
        </div>
      );
    }

    return (
      <div className="p-6 md:p-12 flex flex-col items-center justify-center min-w-[280px] md:min-w-[400px]">
        <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl bg-navy-deep/10 flex items-center justify-center mb-4 md:mb-6">
          <DocIcon className="w-8 h-8 md:w-12 md:h-12 text-navy-deep/70" />
        </div>
        <h3 className="font-medium text-navy-deep text-center text-sm md:text-lg mb-2 max-w-[250px] md:max-w-[350px] truncate">
          {currentDoc?.filename}
        </h3>
        <p className="text-navy-deep/50 text-xs md:text-sm mb-1">
          {currentDoc ? getDocumentTypeLabel(currentDoc.mimeType) : ''}
        </p>
        <p className="text-navy-deep/40 text-xs mb-4 md:mb-6">
          {currentDoc ? formatFileSize(currentDoc.size) : ''}
        </p>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 bg-navy-deep text-cream rounded-lg hover:bg-navy-deep/90 transition-colors text-sm md:text-base"
        >
          <Download className="w-4 h-4" />
          {t('download')}
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-navy-deep/90 backdrop-blur-md cursor-default"
        style={{ animation: 'fadeIn 0.5s ease-out' }}
        onClick={onClose}
        aria-label={t('close')}
      />

      {/* Content container */}
      <div
        className="relative w-full h-full flex flex-col items-center justify-center p-4 md:p-8"
        style={{ animation: 'documentReveal 0.8s cubic-bezier(0.22, 1, 0.36, 1)' }}
      >
        {/* Top bar with title and actions */}
        <div
          className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 md:p-6 bg-gradient-to-b from-navy-deep/80 to-transparent"
          style={{ animation: 'slideDown 0.6s ease-out 0.3s both' }}
        >
          <h2 className="font-serif-brand text-base md:text-xl lg:text-2xl text-cream/90 truncate max-w-[50%] md:max-w-[60%]">
            {title}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="p-2 rounded-full bg-cream/10 text-cream hover:bg-cream/20 transition-colors duration-300"
              aria-label="Download"
            >
              <Download className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-2 rounded-full bg-cream/10 text-cream hover:bg-gold-soft/30 transition-colors duration-300"
                aria-label={t('edit')}
              >
                <Pencil className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-cream/10 text-cream hover:bg-red-500/30 transition-colors duration-300"
              aria-label={t('close')}
            >
              <X className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>

        {/* Main document area */}
        <div className="relative flex items-center justify-center w-full max-w-4xl">
          {/* Navigation arrows */}
          {hasMultiple && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-2 md:left-4 z-10 p-3 rounded-full bg-navy-deep/60 text-cream hover:bg-navy-deep/80 transition-all duration-300 hover:scale-110"
                aria-label={t('previous')}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-2 md:right-4 z-10 p-3 rounded-full bg-navy-deep/60 text-cream hover:bg-navy-deep/80 transition-all duration-300 hover:scale-110"
                aria-label={t('next')}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Document preview */}
          <div
            className="relative bg-white rounded-lg shadow-2xl overflow-hidden"
            style={{ animation: 'documentCardReveal 0.8s ease-out 0.2s both' }}
          >
            {renderDocumentPreview()}

            {/* File info bar */}
            <div className="bg-gray-50 px-4 py-2 md:px-6 md:py-3 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <DocIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-xs md:text-sm text-gray-600 truncate">
                    {currentDoc?.filename}
                  </span>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                  {currentDoc ? formatFileSize(currentDoc.size) : ''}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Thumbnail strip for multiple documents */}
        {hasMultiple && (
          <div
            className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-center gap-2 p-4 md:p-6 bg-gradient-to-t from-navy-deep/80 to-transparent"
            style={{ animation: 'slideUp 0.6s ease-out 0.3s both' }}
          >
            <div className="flex items-center gap-2 overflow-x-auto py-2 px-4 max-w-full">
              {documents.map((doc, index) => {
                const ItemIcon = getDocumentIcon(doc.mimeType);
                return (
                  <button
                    key={doc.id}
                    onClick={() => setCurrentIndex(index)}
                    className={`relative flex-shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-lg overflow-hidden transition-all duration-300 ${
                      index === currentIndex
                        ? 'ring-2 ring-gold-heritage ring-offset-2 ring-offset-navy-deep scale-105'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    {doc.type === 'image' && doc.url ? (
                      <Image
                        src={doc.url}
                        alt={doc.filename}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full bg-white flex items-center justify-center">
                        <ItemIcon className="w-6 h-6 md:w-8 md:h-8 text-navy-deep/50" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="text-cream/60 text-xs md:text-sm ml-2 md:ml-4">
              {currentIndex + 1} / {documents.length}
            </div>
          </div>
        )}
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

        @keyframes documentReveal {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes documentCardReveal {
          0% {
            opacity: 0;
            transform: scale(0.95) translateY(20px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
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

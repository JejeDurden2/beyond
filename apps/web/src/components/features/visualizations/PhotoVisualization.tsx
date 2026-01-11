'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Pencil, X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import type { KeepsakeMedia } from '@/types';

interface PhotoVisualizationProps {
  title: string;
  media: KeepsakeMedia[];
  onEdit: () => void;
  onClose: () => void;
}

export function PhotoVisualization({ title, media, onEdit, onClose }: PhotoVisualizationProps) {
  const t = useTranslations('keepsakes.visualization');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const images = media.filter((m) => m.type === 'image');
  const currentImage = images[currentIndex];
  const hasMultiple = images.length > 1;

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setIsZoomed(false);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    setIsZoomed(false);
  };

  const toggleZoom = () => {
    setIsZoomed((prev) => !prev);
  };

  if (images.length === 0) {
    onEdit();
    return null;
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

      {/* Frame container */}
      <div
        className="relative w-full h-full flex flex-col items-center justify-center p-4 md:p-8"
        style={{ animation: 'photoReveal 0.8s cubic-bezier(0.22, 1, 0.36, 1)' }}
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
              onClick={toggleZoom}
              className="p-2 rounded-full bg-cream/10 text-cream hover:bg-cream/20 transition-colors duration-300"
              aria-label={isZoomed ? t('zoomOut') : t('zoomIn')}
            >
              {isZoomed ? (
                <ZoomOut className="w-4 h-4 md:w-5 md:h-5" />
              ) : (
                <ZoomIn className="w-4 h-4 md:w-5 md:h-5" />
              )}
            </button>
            <button
              onClick={onEdit}
              className="p-2 rounded-full bg-cream/10 text-cream hover:bg-gold-soft/30 transition-colors duration-300"
              aria-label={t('edit')}
            >
              <Pencil className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-cream/10 text-cream hover:bg-red-500/30 transition-colors duration-300"
              aria-label={t('close')}
            >
              <X className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>

        {/* Main image area */}
        <div
          className={`relative flex items-center justify-center transition-all duration-500 ${
            isZoomed ? 'w-full h-full' : 'max-w-4xl max-h-[70vh]'
          }`}
        >
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

          {/* Photo frame with mat and shadow */}
          <div
            className={`relative transition-transform duration-500 ${isZoomed ? 'scale-100' : ''}`}
            style={{
              animation: 'frameReveal 1s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both',
            }}
          >
            {/* Outer frame (dark wood effect) */}
            <div
              className="p-2 md:p-3 rounded-sm"
              style={{
                background: 'linear-gradient(145deg, #2c1810 0%, #1a0f0a 50%, #2c1810 100%)',
                boxShadow: `
                  0 25px 50px -12px rgba(0, 0, 0, 0.5),
                  inset 0 1px 0 0 rgba(255, 255, 255, 0.1),
                  inset 0 -1px 0 0 rgba(0, 0, 0, 0.3)
                `,
              }}
            >
              {/* Inner mat (cream colored) */}
              <div
                className="p-2 md:p-4 lg:p-8"
                style={{
                  background: 'linear-gradient(180deg, #F5F0E6 0%, #EDE6D9 100%)',
                  boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.05)',
                }}
              >
                {/* Image container */}
                <div className="relative overflow-hidden bg-warm-gray/20">
                  {currentImage?.url ? (
                    <img
                      src={currentImage.url}
                      alt={currentImage.filename}
                      className={`block transition-transform duration-500 ${
                        isZoomed
                          ? 'max-h-[80vh] max-w-[90vw]'
                          : 'max-h-[40vh] max-w-[85vw] md:max-h-[50vh] md:max-w-[70vw]'
                      } w-auto h-auto object-contain`}
                      style={{
                        animation: 'imageReveal 0.8s ease-out',
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-48 w-64 md:h-64 md:w-96 bg-warm-gray/30 text-navy-deep/50 text-sm md:text-base">
                      {t('imageNotAvailable')}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Caption */}
            {currentImage?.filename && (
              <div
                className="absolute -bottom-6 md:-bottom-8 left-1/2 -translate-x-1/2 text-cream/60 text-xs md:text-sm font-serif-brand italic truncate max-w-[90%]"
                style={{ animation: 'fadeIn 0.8s ease-out 0.5s both' }}
              >
                {currentImage.filename}
              </div>
            )}
          </div>
        </div>

        {/* Thumbnail strip for multiple images */}
        {hasMultiple && (
          <div
            className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-center gap-2 p-4 md:p-6 bg-gradient-to-t from-navy-deep/80 to-transparent"
            style={{ animation: 'slideUp 0.6s ease-out 0.3s both' }}
          >
            <div className="flex items-center gap-2 overflow-x-auto py-2 px-4 max-w-full">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => {
                    setCurrentIndex(index);
                    setIsZoomed(false);
                  }}
                  className={`relative flex-shrink-0 w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-sm overflow-hidden transition-all duration-300 ${
                    index === currentIndex
                      ? 'ring-2 ring-gold-heritage ring-offset-2 ring-offset-navy-deep scale-105'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  {image.url ? (
                    <img
                      src={image.url}
                      alt={image.filename}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-warm-gray/30" />
                  )}
                </button>
              ))}
            </div>
            <div className="text-cream/60 text-xs md:text-sm ml-2 md:ml-4">
              {currentIndex + 1} / {images.length}
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

        @keyframes photoReveal {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes frameReveal {
          0% {
            opacity: 0;
            transform: scale(0.9) rotateX(10deg);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotateX(0deg);
          }
        }

        @keyframes imageReveal {
          from {
            opacity: 0;
            filter: blur(10px);
          }
          to {
            opacity: 1;
            filter: blur(0);
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

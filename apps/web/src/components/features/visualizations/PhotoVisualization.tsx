'use client';

import { useState, useEffect, useCallback } from 'react';
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
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const images = media.filter((m) => m.type === 'image');
  const currentImage = images[currentIndex];
  const hasMultiple = images.length > 1;

  const goToPrevious = useCallback(() => {
    setIsImageLoaded(false);
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setIsZoomed(false);
  }, [images.length]);

  const goToNext = useCallback(() => {
    setIsImageLoaded(false);
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    setIsZoomed(false);
  }, [images.length]);

  const toggleZoom = () => {
    setIsZoomed((prev) => !prev);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && hasMultiple) {
        goToPrevious();
      } else if (e.key === 'ArrowRight' && hasMultiple) {
        goToNext();
      } else if (e.key === ' ') {
        e.preventDefault();
        toggleZoom();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasMultiple, goToPrevious, goToNext]);

  if (images.length === 0) {
    onEdit();
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop with subtle texture */}
      <button
        type="button"
        className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-[#0d0d14] to-[#08080c] cursor-default"
        style={{ animation: 'backdropFade 0.6s ease-out' }}
        onClick={onClose}
        aria-label="Close"
      />

      {/* Ambient light effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(184, 134, 11, 0.03) 0%, transparent 70%)',
          animation: 'ambientPulse 8s ease-in-out infinite',
        }}
      />

      {/* Main container */}
      <div className="relative w-full h-full flex flex-col">
        {/* Minimal top bar */}
        <div
          className="relative z-30 flex items-center justify-between px-4 py-3 md:px-8 md:py-5"
          style={{ animation: 'fadeSlideDown 0.5s ease-out 0.2s both' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-gradient-to-b from-gold-heritage to-gold-heritage/30 rounded-full" />
            <h2 className="font-serif-brand text-lg md:text-xl text-cream/90 tracking-wide">
              {title}
            </h2>
          </div>

          <div className="flex items-center gap-1 md:gap-2">
            <button
              onClick={toggleZoom}
              className="group relative p-2.5 md:p-3 rounded-full transition-all duration-300 hover:bg-white/5"
              aria-label={isZoomed ? t('zoomOut') : t('zoomIn')}
            >
              {isZoomed ? (
                <ZoomOut className="w-4 h-4 md:w-5 md:h-5 text-cream/60 group-hover:text-cream transition-colors" />
              ) : (
                <ZoomIn className="w-4 h-4 md:w-5 md:h-5 text-cream/60 group-hover:text-cream transition-colors" />
              )}
            </button>
            <button
              onClick={onEdit}
              className="group relative p-2.5 md:p-3 rounded-full transition-all duration-300 hover:bg-white/5"
              aria-label={t('edit')}
            >
              <Pencil className="w-4 h-4 md:w-5 md:h-5 text-cream/60 group-hover:text-gold-heritage transition-colors" />
            </button>
            <button
              onClick={onClose}
              className="group relative p-2.5 md:p-3 rounded-full transition-all duration-300 hover:bg-white/5"
              aria-label={t('close')}
            >
              <X className="w-4 h-4 md:w-5 md:h-5 text-cream/60 group-hover:text-cream transition-colors" />
            </button>
          </div>
        </div>

        {/* Image area */}
        <div className="flex-1 relative flex items-center justify-center px-4 md:px-16 lg:px-24">
          {/* Navigation arrows - elegant minimal style */}
          {hasMultiple && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-2 md:left-6 lg:left-12 z-20 group p-3 md:p-4 rounded-full transition-all duration-300 hover:bg-white/5"
                aria-label={t('previous')}
              >
                <ChevronLeft className="w-6 h-6 md:w-8 md:h-8 text-cream/40 group-hover:text-cream transition-colors" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-2 md:right-6 lg:right-12 z-20 group p-3 md:p-4 rounded-full transition-all duration-300 hover:bg-white/5"
                aria-label={t('next')}
              >
                <ChevronRight className="w-6 h-6 md:w-8 md:h-8 text-cream/40 group-hover:text-cream transition-colors" />
              </button>
            </>
          )}

          {/* Photo with museum-style presentation */}
          <div
            className={`relative transition-all duration-700 ease-out ${
              isZoomed ? 'scale-100' : ''
            }`}
            style={{ animation: 'photoEnter 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both' }}
          >
            {/* Subtle spotlight effect behind photo */}
            <div
              className="absolute -inset-20 md:-inset-32 pointer-events-none"
              style={{
                background:
                  'radial-gradient(ellipse 100% 100% at 50% 50%, rgba(255,255,255,0.02) 0%, transparent 70%)',
              }}
            />

            {/* Premium frame */}
            <div
              className="relative"
              style={{
                boxShadow: `
                  0 0 0 1px rgba(255,255,255,0.03),
                  0 4px 16px rgba(0,0,0,0.4),
                  0 12px 40px rgba(0,0,0,0.3),
                  0 24px 80px rgba(0,0,0,0.2)
                `,
              }}
            >
              {/* Outer frame - thin gold accent */}
              <div
                className="p-[2px] md:p-[3px]"
                style={{
                  background:
                    'linear-gradient(145deg, rgba(184,134,11,0.4) 0%, rgba(184,134,11,0.1) 50%, rgba(184,134,11,0.3) 100%)',
                }}
              >
                {/* Inner frame - dark elegant */}
                <div
                  className="p-1 md:p-1.5"
                  style={{
                    background: 'linear-gradient(145deg, #1a1a1f 0%, #0f0f12 100%)',
                  }}
                >
                  {/* Mat - soft warm tone */}
                  <div
                    className="p-3 md:p-6 lg:p-10"
                    style={{
                      background: 'linear-gradient(180deg, #FAF8F4 0%, #F5F2EC 100%)',
                    }}
                  >
                    {/* Image container */}
                    <div className="relative bg-[#0a0a0a]">
                      {currentImage?.url ? (
                        <>
                          {/* Loading placeholder */}
                          {!isImageLoaded && (
                            <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a]">
                              <div className="w-8 h-8 border-2 border-gold-heritage/30 border-t-gold-heritage rounded-full animate-spin" />
                            </div>
                          )}
                          <img
                            src={currentImage.url}
                            alt={currentImage.filename}
                            onLoad={() => setIsImageLoaded(true)}
                            className={`block transition-all duration-700 ${
                              isZoomed
                                ? 'max-h-[85vh] max-w-[90vw]'
                                : 'max-h-[45vh] max-w-[80vw] md:max-h-[55vh] md:max-w-[65vw] lg:max-h-[60vh] lg:max-w-[55vw]'
                            } w-auto h-auto object-contain ${
                              isImageLoaded ? 'opacity-100' : 'opacity-0'
                            }`}
                            style={{
                              animation: isImageLoaded ? 'imageReveal 0.6s ease-out' : undefined,
                            }}
                          />
                        </>
                      ) : (
                        <div className="flex items-center justify-center h-48 w-64 md:h-72 md:w-96 bg-[#0a0a0a] text-cream/30 text-sm font-light tracking-wide">
                          {t('imageNotAvailable')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Elegant caption */}
            {currentImage?.filename && !isZoomed && (
              <div
                className="absolute -bottom-10 md:-bottom-12 left-1/2 -translate-x-1/2 text-center"
                style={{ animation: 'captionFade 0.6s ease-out 0.4s both' }}
              >
                <p className="text-cream/40 text-xs md:text-sm font-light tracking-widest uppercase">
                  {currentImage.filename.split('.')[0]}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Thumbnail strip - minimal elegant */}
        {hasMultiple && (
          <div
            className="relative z-20 py-4 md:py-6 px-4"
            style={{ animation: 'fadeSlideUp 0.5s ease-out 0.3s both' }}
          >
            <div className="flex items-center justify-center gap-3 md:gap-4">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => {
                    if (index !== currentIndex) {
                      setIsImageLoaded(false);
                      setCurrentIndex(index);
                      setIsZoomed(false);
                    }
                  }}
                  className={`relative flex-shrink-0 transition-all duration-500 ${
                    index === currentIndex
                      ? 'w-14 h-14 md:w-16 md:h-16'
                      : 'w-10 h-10 md:w-12 md:h-12 opacity-40 hover:opacity-70'
                  }`}
                >
                  {/* Active indicator */}
                  {index === currentIndex && (
                    <div
                      className="absolute -inset-1 rounded-sm"
                      style={{
                        background:
                          'linear-gradient(145deg, rgba(184,134,11,0.5) 0%, rgba(184,134,11,0.2) 100%)',
                      }}
                    />
                  )}
                  <div className="relative w-full h-full overflow-hidden rounded-sm">
                    {image.url ? (
                      <img
                        src={image.url}
                        alt={image.filename}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-cream/10" />
                    )}
                  </div>
                </button>
              ))}

              {/* Counter */}
              <div className="ml-4 md:ml-6 flex items-center gap-2">
                <span className="text-cream/30 text-xs font-light tracking-widest">
                  {String(currentIndex + 1).padStart(2, '0')}
                </span>
                <span className="w-4 h-px bg-cream/20" />
                <span className="text-cream/30 text-xs font-light tracking-widest">
                  {String(images.length).padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes backdropFade {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes ambientPulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        @keyframes fadeSlideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes photoEnter {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes imageReveal {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes captionFade {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(5px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

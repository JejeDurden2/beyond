'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AppShell } from '@/components/layout';
import { createKeepsake } from '@/lib/api/keepsakes';
import { ApiError } from '@/lib/api/client';
import type { KeepsakeType } from '@/types';

const typeOptions: { type: KeepsakeType; icon: string; label: string; description: string }[] = [
  { type: 'text', icon: '📝', label: 'Text', description: 'A simple note or message' },
  { type: 'letter', icon: '✉️', label: 'Letter', description: 'A heartfelt letter' },
  { type: 'photo', icon: '📷', label: 'Photo', description: 'A precious memory' },
  { type: 'video', icon: '🎬', label: 'Video', description: 'A video message' },
  { type: 'wish', icon: '⭐', label: 'Wish', description: 'A final wish or hope' },
  { type: 'scheduled_action', icon: '📅', label: 'Action', description: 'A scheduled task' },
];

export default function NewKeepsakePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<KeepsakeType | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTypeSelect = (type: KeepsakeType) => {
    setSelectedType(type);
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType || !title || !content) return;

    setIsLoading(true);
    setError(null);

    try {
      await createKeepsake({
        type: selectedType,
        title,
        content,
      });
      router.push('/keepsakes');
    } catch (err) {
      if (err instanceof ApiError) {
        const message = (err.data as { message?: string })?.message || 'Failed to create keepsake';
        setError(message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const typeLabel = selectedType
    ? typeOptions.find((t) => t.type === selectedType)?.label
    : '';

  return (
    <AppShell requireAuth>
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-8">
          <Link
            href="/keepsakes"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 ease-out inline-flex items-center gap-1"
          >
            ← Back to Keepsakes
          </Link>
        </div>

        {step === 1 && (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center space-y-2">
              <h1 className="font-display text-display-sm text-foreground">
                Create a Keepsake
              </h1>
              <p className="text-muted-foreground">
                Choose what you&apos;d like to preserve.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {typeOptions.map((option) => (
                <button
                  key={option.type}
                  onClick={() => handleTypeSelect(option.type)}
                  className="bg-card rounded-2xl border border-border/50 shadow-soft p-6 text-center transition-all duration-200 ease-out hover:shadow-soft-md hover:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/20"
                >
                  <span className="text-3xl block mb-2">{option.icon}</span>
                  <span className="font-medium text-foreground block">{option.label}</span>
                  <span className="text-xs text-muted-foreground">{option.description}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && selectedType && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setStep(1)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 ease-out"
              >
                ← Change type
              </button>
              <span className="text-sm text-muted-foreground">Step 1 of 1</span>
            </div>

            <div className="text-center space-y-2">
              <h1 className="font-display text-display-sm text-foreground">
                Write Your {typeLabel}
              </h1>
            </div>

            <div className="bg-card rounded-2xl border border-border/50 shadow-soft p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="title" className="block text-sm font-medium text-foreground">
                    Title
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full rounded-xl border border-border/60 bg-background px-4 py-3 shadow-inner-soft focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-colors duration-200 ease-out"
                    placeholder={`Give your ${typeLabel?.toLowerCase()} a title`}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="content" className="block text-sm font-medium text-foreground">
                    Content
                  </label>
                  <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    rows={10}
                    className="w-full rounded-xl border border-border/60 bg-background px-4 py-3 shadow-inner-soft focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-colors duration-200 ease-out resize-none"
                    placeholder="Write your message here..."
                  />
                </div>

                <div className="flex gap-4 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => router.push('/keepsakes')}
                    className="border border-border/60 text-foreground rounded-xl px-6 py-3 font-medium transition-colors duration-200 ease-out hover:bg-muted/50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || !title || !content}
                    className="bg-foreground text-background hover:bg-foreground/90 rounded-xl px-6 py-3 font-medium shadow-soft transition-all duration-200 ease-out hover:shadow-soft-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Creating...' : 'Create Keepsake'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

'use client';

import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout';
import { getKeepsake, updateKeepsake, deleteKeepsake } from '@/lib/api/keepsakes';
import { ApiError } from '@/lib/api/client';
import type { Keepsake, KeepsakeType } from '@/types';

const typeLabels: Record<KeepsakeType, string> = {
  text: 'Text',
  letter: 'Letter',
  photo: 'Photo',
  video: 'Video',
  wish: 'Wish',
  scheduled_action: 'Action',
};

export default function KeepsakeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [keepsake, setKeepsake] = useState<Keepsake | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    async function loadKeepsake() {
      try {
        const data = await getKeepsake(id);
        setKeepsake(data);
        setTitle(data.title);
        setContent(data.content || '');
      } catch (err) {
        console.error('Failed to load keepsake:', err);
        setError('Failed to load keepsake');
      } finally {
        setIsLoading(false);
      }
    }
    loadKeepsake();
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keepsake) return;

    setIsSaving(true);
    setError(null);

    try {
      const updated = await updateKeepsake(id, { title, content });
      setKeepsake({ ...keepsake, ...updated });
    } catch (err) {
      if (err instanceof ApiError) {
        const message = (err.data as { message?: string })?.message || 'Failed to save';
        setError(message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      await deleteKeepsake(id);
      router.push('/keepsakes');
    } catch (err) {
      if (err instanceof ApiError) {
        const message = (err.data as { message?: string })?.message || 'Failed to delete';
        setError(message);
      } else {
        setError('An unexpected error occurred');
      }
      setIsDeleting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <AppShell requireAuth>
        <div className="max-w-2xl mx-auto px-6 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-6 w-32 bg-muted rounded" />
            <div className="h-10 w-64 bg-muted rounded" />
            <div className="bg-card rounded-2xl border border-border/50 p-8 space-y-6">
              <div className="h-12 bg-muted rounded-xl" />
              <div className="h-64 bg-muted rounded-xl" />
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!keepsake) {
    return (
      <AppShell requireAuth>
        <div className="max-w-2xl mx-auto px-6 py-12 text-center">
          <h1 className="font-display text-display-sm text-foreground mb-4">
            Keepsake not found
          </h1>
          <Link
            href="/keepsakes"
            className="text-accent hover:text-accent/80 transition-colors"
          >
            ← Back to Keepsakes
          </Link>
        </div>
      </AppShell>
    );
  }

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

        <div className="space-y-8 animate-fade-in">
          <div className="space-y-2">
            <h1 className="font-display text-display-sm text-foreground">
              Edit {typeLabels[keepsake.type]}
            </h1>
            <p className="text-sm text-muted-foreground">
              Created {formatDate(keepsake.createdAt)} · Last updated {formatDate(keepsake.updatedAt)}
            </p>
          </div>

          <div className="bg-card rounded-2xl border border-border/50 shadow-soft p-8">
            <form onSubmit={handleSave} className="space-y-6">
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
                />
              </div>

              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors duration-200 ease-out"
                >
                  Delete keepsake
                </button>
                <button
                  type="submit"
                  disabled={isSaving || !title || !content}
                  className="bg-foreground text-background hover:bg-foreground/90 rounded-xl px-6 py-3 font-medium shadow-soft transition-all duration-200 ease-out hover:shadow-soft-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm flex items-center justify-center p-6 z-50">
            <div className="bg-card rounded-2xl border border-border/50 shadow-soft-lg p-8 max-w-md w-full animate-slide-up">
              <h2 className="font-display text-xl text-foreground mb-2">
                Delete this keepsake?
              </h2>
              <p className="text-muted-foreground mb-6">
                This action cannot be undone. The keepsake &ldquo;{keepsake.title}&rdquo; will be permanently deleted.
              </p>
              <div className="flex gap-4 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="border border-border/60 text-foreground rounded-xl px-6 py-3 font-medium transition-colors duration-200 ease-out hover:bg-muted/50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-red-600 text-white hover:bg-red-700 rounded-xl px-6 py-3 font-medium transition-colors duration-200 ease-out disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

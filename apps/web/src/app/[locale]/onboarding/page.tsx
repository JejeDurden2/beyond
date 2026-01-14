'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useAuth } from '@/hooks/use-auth';
import {
  OnboardingLayout,
  WelcomeStep,
  IdentityStep,
  TrustedPersonStep,
  CompletionStep,
} from '@/components/features/onboarding';
import { updateProfile, completeOnboarding, getAvatarUploadUrl } from '@/lib/api/users';
import { createBeneficiary, setTrustedPerson } from '@/lib/api/beneficiaries';
import type { Relationship } from '@/types';

type Step = 'welcome' | 'identity' | 'trustedPerson' | 'completion';

interface OnboardingData {
  firstName?: string;
  lastName?: string;
  avatarFile?: File;
}

interface TrustedPersonData {
  firstName: string;
  lastName: string;
  email: string;
  relationship: Relationship;
}

const STORAGE_KEY = 'beyond_onboarding_data';

export default function OnboardingPage(): React.ReactElement | null {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [step, setStep] = useState<Step>('welcome');
  const [data, setData] = useState<OnboardingData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if onboarding already completed (but not if we're on completion step)
  useEffect(() => {
    if (user?.onboardingCompletedAt && step !== 'completion') {
      router.replace('/dashboard');
    }
  }, [user, router, step]);

  // Load saved data from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setData(parsed);
        // Resume from last step if we have data
        if (parsed.firstName && parsed.lastName) {
          setStep('trustedPerson');
        }
      } catch {
        // Invalid data, start fresh
      }
    }
  }, []);

  // Save data to localStorage when it changes
  useEffect(() => {
    if (Object.keys(data).length > 0) {
      // Don't save avatarFile to localStorage (File objects can't be serialized)
      const { avatarFile: _, ...savableData } = data;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savableData));
    }
  }, [data]);

  const saveProfileAndComplete = useCallback(
    async (trustedPerson?: TrustedPersonData): Promise<void> => {
      // Save profile only if we have data
      if (data.firstName || data.lastName) {
        await updateProfile({
          ...(data.firstName && { firstName: data.firstName }),
          ...(data.lastName && { lastName: data.lastName }),
        });
      }

      // Upload avatar if provided
      if (data.avatarFile) {
        const { uploadUrl } = await getAvatarUploadUrl(data.avatarFile.name, data.avatarFile.type);
        await fetch(uploadUrl, {
          method: 'PUT',
          body: data.avatarFile,
          headers: { 'Content-Type': data.avatarFile.type },
        });
      }

      // Create beneficiary and set as trusted person if provided
      if (trustedPerson) {
        const beneficiary = await createBeneficiary(trustedPerson);
        await setTrustedPerson(beneficiary.id, true);
      }

      // Complete onboarding
      await completeOnboarding();
      await refreshUser();

      // Clear localStorage
      localStorage.removeItem(STORAGE_KEY);
    },
    [data, refreshUser],
  );

  function handleIdentityComplete(identityData: {
    firstName: string;
    lastName: string;
    avatarFile?: File;
  }): void {
    setData((prev) => ({ ...prev, ...identityData }));
    setStep('trustedPerson');
  }

  const handleTrustedPersonComplete = useCallback(
    async (trustedPerson: TrustedPersonData) => {
      setIsSubmitting(true);
      try {
        await saveProfileAndComplete(trustedPerson);
        setStep('completion');
      } catch (error) {
        console.error('Failed to complete onboarding:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [saveProfileAndComplete],
  );

  const handleTrustedPersonSkip = useCallback(async () => {
    setIsSubmitting(true);
    try {
      await saveProfileAndComplete();
      setStep('completion');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [saveProfileAndComplete]);

  function handleCreateKeepsake(): void {
    router.push('/keepsakes/new');
  }

  function handleExploreDashboard(): void {
    router.push('/dashboard');
  }

  // Don't render anything if user has already completed onboarding (but allow completion step)
  if (user?.onboardingCompletedAt && step !== 'completion') {
    return null;
  }

  return (
    <OnboardingLayout showTrustIndicator={step === 'welcome'}>
      {step === 'welcome' && <WelcomeStep onNext={() => setStep('identity')} />}

      {step === 'identity' && (
        <IdentityStep
          initialData={{
            firstName: data.firstName,
            lastName: data.lastName,
          }}
          onBack={() => setStep('welcome')}
          onNext={handleIdentityComplete}
        />
      )}

      {step === 'trustedPerson' && (
        <TrustedPersonStep
          onBack={() => setStep('identity')}
          onNext={handleTrustedPersonComplete}
          onSkip={handleTrustedPersonSkip}
        />
      )}

      {step === 'completion' && (
        <CompletionStep
          firstName={data.firstName || ''}
          onCreateKeepsake={handleCreateKeepsake}
          onExploreDashboard={handleExploreDashboard}
        />
      )}

      {/* Loading overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="w-8 h-8 border-4 border-navy-deep border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </OnboardingLayout>
  );
}

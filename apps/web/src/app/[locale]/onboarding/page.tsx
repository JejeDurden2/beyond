'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useAuth } from '@/hooks/use-auth';
import {
  OnboardingLayout,
  WelcomeStep,
  IdentityStep,
  IntentionStep,
  BeneficiaryStep,
  CompletionStep,
} from '@/components/features/onboarding';
import { updateProfile, completeOnboarding, getAvatarUploadUrl } from '@/lib/api/users';
import { createBeneficiary } from '@/lib/api/beneficiaries';
import type { Relationship } from '@/types';

type Step = 'welcome' | 'identity' | 'intention' | 'beneficiary' | 'completion';
type IntentionType = 'letters' | 'photos' | 'videos' | 'wishes' | 'gifts';

interface OnboardingData {
  firstName?: string;
  lastName?: string;
  avatarFile?: File;
  intentions?: IntentionType[];
}

const STORAGE_KEY = 'beyond_onboarding_data';

export default function OnboardingPage() {
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
          setStep('intention');
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { avatarFile: _, ...savableData } = data;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savableData));
    }
  }, [data]);

  const uploadAvatar = useCallback(async (file: File): Promise<void> => {
    const { uploadUrl } = await getAvatarUploadUrl(file.name, file.type);
    await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });
  }, []);

  const handleIdentityComplete = useCallback(
    async (identityData: { firstName: string; lastName: string; avatarFile?: File }) => {
      setData((prev) => ({ ...prev, ...identityData }));
      setStep('intention');
    },
    [],
  );

  const handleIntentionComplete = useCallback((intentions: IntentionType[]) => {
    setData((prev) => ({ ...prev, intentions }));
    setStep('beneficiary');
  }, []);

  const handleIntentionSkip = useCallback(() => {
    setStep('beneficiary');
  }, []);

  const handleBeneficiaryComplete = useCallback(
    async (beneficiary: {
      firstName: string;
      lastName: string;
      email: string;
      relationship: Relationship;
    }) => {
      setIsSubmitting(true);
      try {
        // Save profile
        await updateProfile({
          firstName: data.firstName,
          lastName: data.lastName,
        });

        // Upload avatar if provided
        if (data.avatarFile) {
          await uploadAvatar(data.avatarFile);
        }

        // Create beneficiary
        await createBeneficiary(beneficiary);

        // Complete onboarding
        await completeOnboarding();
        await refreshUser();

        // Clear localStorage
        localStorage.removeItem(STORAGE_KEY);

        setStep('completion');
      } catch (error) {
        console.error('Failed to complete onboarding:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [data, uploadAvatar, refreshUser],
  );

  const handleBeneficiarySkip = useCallback(async () => {
    setIsSubmitting(true);
    try {
      // Save profile
      await updateProfile({
        firstName: data.firstName,
        lastName: data.lastName,
      });

      // Upload avatar if provided
      if (data.avatarFile) {
        await uploadAvatar(data.avatarFile);
      }

      // Complete onboarding
      await completeOnboarding();
      await refreshUser();

      // Clear localStorage
      localStorage.removeItem(STORAGE_KEY);

      setStep('completion');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [data, uploadAvatar, refreshUser]);

  const handleCreateKeepsake = useCallback(() => {
    router.push('/keepsakes/new');
  }, [router]);

  const handleExploreDashboard = useCallback(() => {
    router.push('/dashboard');
  }, [router]);

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

      {step === 'intention' && (
        <IntentionStep
          initialData={data.intentions}
          onBack={() => setStep('identity')}
          onNext={handleIntentionComplete}
          onSkip={handleIntentionSkip}
        />
      )}

      {step === 'beneficiary' && (
        <BeneficiaryStep
          onBack={() => setStep('intention')}
          onNext={handleBeneficiaryComplete}
          onSkip={handleBeneficiarySkip}
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

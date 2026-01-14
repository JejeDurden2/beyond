'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useAuth } from '@/hooks/use-auth';
import {
  OnboardingLayout,
  BeneficiaryWelcomeStep,
  BeneficiaryProfileStep,
  BeneficiaryCompleteStep,
} from '@/components/features/onboarding';
import { updateProfile, completeOnboarding } from '@/lib/api/users';

type Step = 'welcome' | 'profile' | 'complete';

interface BeneficiaryOnboardingData {
  firstName?: string;
  lastName?: string;
}

const STORAGE_KEY = 'beyond_beneficiary_onboarding_data';

export default function BeneficiaryOnboardingPage(): React.ReactElement | null {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [step, setStep] = useState<Step>('welcome');
  const [data, setData] = useState<BeneficiaryOnboardingData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if onboarding already completed (but not if we're on complete step)
  useEffect(() => {
    if (user?.onboardingCompletedAt && step !== 'complete') {
      router.replace('/portal');
    }
  }, [user, router, step]);

  // Redirect vault owners to standard onboarding
  useEffect(() => {
    if (user?.role === 'VAULT_OWNER') {
      router.replace('/onboarding');
    }
  }, [user, router]);

  // Load saved data from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setData(parsed);
      } catch {
        // Invalid data, start fresh
      }
    }
  }, []);

  // Save data to localStorage when it changes
  useEffect(() => {
    if (Object.keys(data).length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data]);

  const handleProfileComplete = useCallback(
    async (profileData: { firstName: string; lastName: string }) => {
      setData((prev) => ({ ...prev, ...profileData }));
      setIsSubmitting(true);

      try {
        // Save profile
        await updateProfile({
          firstName: profileData.firstName,
          lastName: profileData.lastName,
        });

        // Complete onboarding
        await completeOnboarding();
        await refreshUser();

        // Clear localStorage
        localStorage.removeItem(STORAGE_KEY);

        setStep('complete');
      } catch (error) {
        console.error('Failed to complete onboarding:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [refreshUser],
  );

  function handleViewPortal(): void {
    router.push('/portal');
  }

  // Don't render anything if user has already completed onboarding (but allow complete step)
  if (user?.onboardingCompletedAt && step !== 'complete') {
    return null;
  }

  // Don't render for vault owners
  if (user?.role === 'VAULT_OWNER') {
    return null;
  }

  return (
    <OnboardingLayout showTrustIndicator={step === 'welcome'}>
      {step === 'welcome' && <BeneficiaryWelcomeStep onNext={() => setStep('profile')} />}

      {step === 'profile' && (
        <BeneficiaryProfileStep
          initialData={{
            firstName: data.firstName || user?.firstName || undefined,
            lastName: data.lastName || user?.lastName || undefined,
          }}
          onBack={() => setStep('welcome')}
          onNext={handleProfileComplete}
        />
      )}

      {step === 'complete' && <BeneficiaryCompleteStep onViewPortal={handleViewPortal} />}

      {/* Loading overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="w-8 h-8 border-4 border-navy-deep border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </OnboardingLayout>
  );
}

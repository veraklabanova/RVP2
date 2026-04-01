'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';

export default function Home() {
  const router = useRouter();
  const { state } = useApp();

  useEffect(() => {
    if (state.isOnboarded) {
      router.replace('/dashboard');
    } else {
      router.replace('/onboarding');
    }
  }, [state.isOnboarded, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-pulse text-primary font-semibold text-lg">
        Načítám...
      </div>
    </div>
  );
}

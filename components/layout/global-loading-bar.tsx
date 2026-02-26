'use client';

import { useLoading } from '@/hooks/use-loading';
import { cn } from '@/lib/utils';

export function GlobalLoadingBar() {
  const { isLoading } = useLoading();

  if (!isLoading) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-transparent opacity-0 pointer-events-none" />
    );
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-transparent pointer-events-none">
      <div className="h-full bg-primary animate-loading-bar" />
    </div>
  );
}

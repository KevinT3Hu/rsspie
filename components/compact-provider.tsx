'use client';

import * as React from 'react';
import { useEffect, useState, createContext, useContext } from 'react';

type CompactMode = 'compact' | 'comfortable';

interface CompactContextType {
  compactMode: CompactMode;
  setCompactMode: (mode: CompactMode) => void;
  isCompact: boolean;
}

const CompactContext = createContext<CompactContextType>({
  compactMode: 'comfortable',
  setCompactMode: () => {},
  isCompact: false,
});

const STORAGE_KEY = 'rss-reader-compact-mode';

export function CompactProvider({ children }: { children: React.ReactNode }) {
  const [compactMode, setCompactModeState] = useState<CompactMode>('comfortable');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load from localStorage on mount
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY) as CompactMode | null;
      if (stored === 'compact' || stored === 'comfortable') {
        setCompactModeState(stored);
      }
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    localStorage.setItem(STORAGE_KEY, compactMode);
    
    if (compactMode === 'compact') {
      document.documentElement.classList.add('compact');
    } else {
      document.documentElement.classList.remove('compact');
    }
  }, [compactMode, mounted]);

  const setCompactMode = (mode: CompactMode) => {
    setCompactModeState(mode);
  };

  return (
    <CompactContext.Provider
      value={{
        compactMode,
        setCompactMode,
        isCompact: compactMode === 'compact',
      }}
    >
      {children}
    </CompactContext.Provider>
  );
}

export function useCompact() {
  const context = useContext(CompactContext);
  return context;
}

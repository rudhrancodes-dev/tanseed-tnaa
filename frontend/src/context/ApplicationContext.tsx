import React, { createContext, useContext, useState } from 'react';
import type { ApplicationData, EligibilityResult } from '../types';

type AppView = 'landing' | 'step1' | 'step2' | 'step3' | 'results' | 'draft';

interface ApplicationContextValue {
  view: AppView;
  setView: (v: AppView) => void;
  data: Partial<ApplicationData>;
  setData: (d: Partial<ApplicationData>) => void;
  result: EligibilityResult | null;
  setResult: (r: EligibilityResult | null) => void;
}

const ApplicationContext = createContext<ApplicationContextValue | null>(null);

export function ApplicationProvider({ children }: { children: React.ReactNode }) {
  const [view, setView] = useState<AppView>('landing');
  const [data, setData] = useState<Partial<ApplicationData>>({});
  const [result, setResult] = useState<EligibilityResult | null>(null);

  return (
    <ApplicationContext.Provider value={{ view, setView, data, setData, result, setResult }}>
      {children}
    </ApplicationContext.Provider>
  );
}

export function useApplication() {
  const ctx = useContext(ApplicationContext);
  if (!ctx) throw new Error('useApplication must be used within ApplicationProvider');
  return ctx;
}

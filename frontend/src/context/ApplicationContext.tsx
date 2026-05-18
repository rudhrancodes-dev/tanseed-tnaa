import React, { createContext, useContext, useState } from 'react';
import type { ApplicationData, DraftPaymentState, EligibilityResult } from '../types';

type AppView = 'landing' | 'step1' | 'step2' | 'step3' | 'results' | 'draft';

const STORAGE_KEY = 'tanseed-application-session-v1';

interface PersistedApplicationState {
  view: AppView;
  data: Partial<ApplicationData>;
  result: EligibilityResult | null;
  draftPayment: DraftPaymentState;
}

const DEFAULT_DRAFT_PAYMENT: DraftPaymentState = {
  status: 'idle',
  applicationReference: null,
  orderId: null,
  paymentId: null,
  amount: 199900,
  currency: 'INR',
  error: null,
};

interface ApplicationContextValue {
  view: AppView;
  setView: (v: AppView) => void;
  data: Partial<ApplicationData>;
  setData: (d: Partial<ApplicationData>) => void;
  result: EligibilityResult | null;
  setResult: (r: EligibilityResult | null) => void;
  draftPayment: DraftPaymentState;
  setDraftPayment: React.Dispatch<React.SetStateAction<DraftPaymentState>>;
}

const ApplicationContext = createContext<ApplicationContextValue | null>(null);

export function ApplicationProvider({ children }: { children: React.ReactNode }) {
  const initialState = readPersistedState();
  const [view, setView] = useState<AppView>(initialState.view);
  const [data, setData] = useState<Partial<ApplicationData>>(initialState.data);
  const [result, setResult] = useState<EligibilityResult | null>(initialState.result);
  const [draftPayment, setDraftPayment] = useState<DraftPaymentState>(initialState.draftPayment);

  React.useEffect(() => {
    if (!canUseLocalStorage()) {
      return;
    }

    const sessionState: PersistedApplicationState = { view, data, result, draftPayment };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionState));
  }, [data, draftPayment, result, view]);

  return (
    <ApplicationContext.Provider value={{ view, setView, data, setData, result, setResult, draftPayment, setDraftPayment }}>
      {children}
    </ApplicationContext.Provider>
  );
}

export function useApplication() {
  const ctx = useContext(ApplicationContext);
  if (!ctx) throw new Error('useApplication must be used within ApplicationProvider');
  return ctx;
}

function readPersistedState(): PersistedApplicationState {
  if (typeof window === 'undefined' || !canUseLocalStorage()) {
    return {
      view: 'landing',
      data: {},
      result: null,
      draftPayment: DEFAULT_DRAFT_PAYMENT,
    };
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return {
      view: 'landing',
      data: {},
      result: null,
      draftPayment: DEFAULT_DRAFT_PAYMENT,
    };
  }

  try {
    const parsed = JSON.parse(raw) as Partial<PersistedApplicationState>;
    return {
      view: parsed.view ?? 'landing',
      data: parsed.data ?? {},
      result: parsed.result ?? null,
      draftPayment: {
        ...DEFAULT_DRAFT_PAYMENT,
        ...parsed.draftPayment,
      },
    };
  } catch {
    return {
      view: 'landing',
      data: {},
      result: null,
      draftPayment: DEFAULT_DRAFT_PAYMENT,
    };
  }
}

function canUseLocalStorage() {
  return typeof window !== 'undefined'
    && typeof window.localStorage !== 'undefined'
    && typeof window.localStorage.getItem === 'function'
    && typeof window.localStorage.setItem === 'function';
}

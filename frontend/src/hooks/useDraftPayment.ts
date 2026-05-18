import { useEffect } from 'react';
import {
  createDraftPaymentOrder,
  DRAFT_UNLOCK_AMOUNT,
  DRAFT_UNLOCK_CURRENCY,
  verifyDraftPayment,
} from '../api';
import { useApplication } from '../context/ApplicationContext';

const RAZORPAY_SCRIPT_ID = 'razorpay-checkout-sdk';

export interface DraftPaymentController {
  amountLabel: string;
  error: string | null;
  isPaid: boolean;
  isProcessing: boolean;
  status: 'idle' | 'creating_order' | 'checkout_open' | 'verifying' | 'paid' | 'failed';
  unlockDraft: () => Promise<void>;
}

/**
 * Manages the draft paywall lifecycle: order creation, Razorpay checkout,
 * verification, and restoration after a redirect or page refresh.
 */
export function useDraftPayment(): DraftPaymentController {
  const { data, draftPayment, setDraftPayment, setView } = useApplication();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentId = params.get('razorpay_payment_id');
    const orderId = params.get('razorpay_order_id');
    const signature = params.get('razorpay_signature');

    if (!paymentId || !orderId || !signature || !draftPayment.applicationReference) {
      return;
    }

    void finalizePayment({
      applicationReference: draftPayment.applicationReference,
      orderId,
      paymentId,
      signature,
    });

    params.delete('razorpay_payment_id');
    params.delete('razorpay_order_id');
    params.delete('razorpay_signature');
    const nextUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}${window.location.hash}`;
    window.history.replaceState({}, '', nextUrl);
  }, [draftPayment.applicationReference]);

  async function unlockDraft() {
    if (draftPayment.status === 'paid') {
      setView('draft');
      return;
    }

    const companyName = data.entity?.entityName?.trim();
    if (!companyName) {
      setDraftPayment((current) => ({
        ...current,
        status: 'failed',
        error: 'Complete the application details before unlocking the draft.',
      }));
      return;
    }

    setDraftPayment((current) => ({
      ...current,
      status: 'creating_order',
      error: null,
    }));

    try {
      const order = await createDraftPaymentOrder({
        applicationReference: currentApplicationReference(draftPayment.applicationReference, companyName),
        companyName,
      });

      setDraftPayment({
        status: 'checkout_open',
        applicationReference: order.applicationReference,
        orderId: order.orderId,
        paymentId: null,
        amount: order.amount,
        currency: order.currency,
        error: null,
      });

      await openRazorpayCheckout({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'TANSEED Grant Assistant',
        description: 'Unlock AI-generated application draft',
        order_id: order.orderId,
        notes: {
          applicationReference: order.applicationReference,
          companyName,
        },
        theme: {
          color: '#1E3A8A',
        },
        handler: (response) => {
          void finalizePayment({
            applicationReference: order.applicationReference,
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
          });
        },
        modal: {
          ondismiss: () => {
            setDraftPayment((current) =>
              current.status === 'paid'
                ? current
                : {
                    ...current,
                    status: 'failed',
                    error: 'Payment was cancelled before the draft was unlocked.',
                  },
            );
          },
        },
      });
    } catch (error) {
      setDraftPayment((current) => ({
        ...current,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unable to start payment.',
      }));
    }
  }

  async function finalizePayment({
    applicationReference,
    orderId,
    paymentId,
    signature,
  }: {
    applicationReference: string;
    orderId: string;
    paymentId: string;
    signature: string;
  }) {
    setDraftPayment((current) => ({
      ...current,
      status: 'verifying',
      applicationReference,
      orderId,
      paymentId,
      error: null,
    }));

    try {
      const verification = await verifyDraftPayment({
        applicationReference,
        orderId,
        paymentId,
        signature,
      });

      if (!verification.paid) {
        throw new Error('Payment was not verified. Please retry.');
      }

      setDraftPayment((current) => ({
        ...current,
        status: 'paid',
        applicationReference: verification.applicationReference,
        orderId,
        paymentId: verification.paymentId,
        error: null,
      }));
      setView('draft');
    } catch (error) {
      setDraftPayment((current) => ({
        ...current,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unable to verify payment.',
      }));
      setView('results');
    }
  }

  return {
    amountLabel: formatAmount(draftPayment.amount || DRAFT_UNLOCK_AMOUNT, draftPayment.currency || DRAFT_UNLOCK_CURRENCY),
    error: draftPayment.error,
    isPaid: draftPayment.status === 'paid',
    isProcessing: draftPayment.status === 'creating_order' || draftPayment.status === 'checkout_open' || draftPayment.status === 'verifying',
    status: draftPayment.status,
    unlockDraft,
  };
}

function currentApplicationReference(existingReference: string | null, companyName: string) {
  if (existingReference) {
    return existingReference;
  }

  const slug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `draft-${slug || 'application'}-${Date.now()}`;
}

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount / 100);
}

async function openRazorpayCheckout(options: RazorpayOptions) {
  await loadRazorpayScript();

  if (!window.Razorpay) {
    throw new Error('Razorpay SDK failed to load. Check your network or content security policy.');
  }

  const checkout = new window.Razorpay(options);
  checkout.open();
}

function loadRazorpayScript() {
  const existingScript = document.getElementById(RAZORPAY_SCRIPT_ID) as HTMLScriptElement | null;
  if (existingScript) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.id = RAZORPAY_SCRIPT_ID;
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Unable to load Razorpay checkout script.'));
    document.body.appendChild(script);
  });
}

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_DRAFT_UNLOCK_AMOUNT?: string;
  readonly VITE_DRAFT_UNLOCK_CURRENCY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface RazorpayPaymentSuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayPaymentSuccessResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
}

interface Window {
  Razorpay?: new (options: RazorpayOptions) => {
    open: () => void;
  };
}

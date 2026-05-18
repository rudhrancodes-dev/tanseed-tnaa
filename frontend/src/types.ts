export interface EntityEligibilityData {
  entityName: string;
  registrationType: string;
  cin: string;
  location: string;
  indianOwnership: number;
  tansimId: string;
  dpiitId: string;
  employees: number;
  description: string;
}

export interface FinancialsData {
  avgProfit3y: number;
  prioritySector: string;
  trlLevel: number;
  noDues: boolean;
  notBlacklisted: boolean;
}

export interface DocumentsData {
  pitchDeckUrl: string;
  financialModelUrl: string;
  prototypeVideoUrl: string;
  additionalDocsUrls: string[];
}

export interface ApplicationData {
  entity: EntityEligibilityData;
  financials: FinancialsData;
  documents: DocumentsData;
}

export interface EligibilityResult {
  status: 'PASS' | 'REVIEW' | 'FAIL';
  ticketSize?: string;
  missingInfo?: string[];
  failReason?: string;
  criteria: CriterionResult[];
  applicationDraft?: ApplicationDraft;
}

export interface CriterionResult {
  criterion: string;
  status: 'PASS' | 'FAIL' | 'REVIEW' | 'INFO';
  justification: string;
}

export interface ApplicationDraft {
  executiveSummary: string;
  marketOpportunity: string;
  useOfFunds: string;
  impactStatement: string;
}

export interface DraftPaymentState {
  status: 'idle' | 'creating_order' | 'checkout_open' | 'verifying' | 'paid' | 'failed';
  applicationReference: string | null;
  orderId: string | null;
  paymentId: string | null;
  amount: number;
  currency: string;
  error: string | null;
}

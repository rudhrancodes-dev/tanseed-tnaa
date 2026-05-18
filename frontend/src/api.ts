import type { ApplicationData, EligibilityResult } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

export const DRAFT_UNLOCK_AMOUNT = Number(import.meta.env.VITE_DRAFT_UNLOCK_AMOUNT ?? 199900);
export const DRAFT_UNLOCK_CURRENCY = import.meta.env.VITE_DRAFT_UNLOCK_CURRENCY ?? 'INR';

export interface DraftPaymentOrderRequest {
  applicationReference: string;
  companyName: string;
}

export interface DraftPaymentOrderResponse {
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  applicationReference: string;
}

export interface DraftPaymentVerificationRequest {
  applicationReference: string;
  orderId: string;
  paymentId: string;
  signature: string;
}

export interface DraftPaymentVerificationResponse {
  paid: boolean;
  applicationReference: string;
  paymentId: string;
}

export async function runEligibilityCheck(data: ApplicationData): Promise<EligibilityResult> {
  const requestBody = {
    company_name: data.entity.entityName,
    sector: data.financials.prioritySector,
    revenue: data.financials.avgProfit3y / 100000,
    employees: data.entity.employees,
    description: data.entity.description,
  };
  try {
    const res = await fetch('http://localhost:8000/eligibility', {
      // The current frontend stays compatible with the backend RAG service contract.
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });
    if (!res.ok) throw new Error('API error');
    const apiResult = await res.json();
    const criteria = (apiResult.reasons || []).map((r: string) => ({
      criterion: r.split(':')[0] || r.split(' ')[0] || 'Info',
      status: apiResult.eligible ? 'PASS' as const : 'INFO' as const,
      justification: r,
    }));
    return {
      status: apiResult.eligible ? 'PASS' : 'FAIL',
      ticketSize: apiResult.eligible && apiResult.matching_schemes?.length
        ? apiResult.matching_schemes.join(', ')
        : undefined,
      failReason: !apiResult.eligible ? apiResult.reasons?.join('; ') : undefined,
      criteria,
    };
  } catch (e) {
    console.error('Eligibility API error:', e);
    return deriveLocalResult(data);
  }
}

export async function fetchDraft(data: ApplicationData) {
  try {
    const res = await fetch('http://localhost:8000/draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company_name: data.entity.entityName,
        registration_type: data.entity.registrationType,
        sector: data.financials.prioritySector,
        location: data.entity.location,
        description: data.entity.description,
      }),
    });
    if (!res.ok) throw new Error('API error');
    const raw: Record<string, string> = await res.json();
    return {
      executiveSummary: raw.executive_summary,
      marketOpportunity: raw.market_opportunity,
      useOfFunds: raw.use_of_funds,
      impactStatement: raw.impact_statement,
    };
  } catch {
    return generateLocalDraft(data);
  }
}

export async function createDraftPaymentOrder(payload: DraftPaymentOrderRequest): Promise<DraftPaymentOrderResponse> {
  const res = await fetch(`${API_BASE_URL}/payments/razorpay/order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...payload,
      amount: DRAFT_UNLOCK_AMOUNT,
      currency: DRAFT_UNLOCK_CURRENCY,
      purpose: 'application_draft',
    }),
  });

  if (!res.ok) {
    throw new Error('Unable to start Razorpay checkout. Confirm the payment API is available.');
  }

  return res.json();
}

export async function verifyDraftPayment(payload: DraftPaymentVerificationRequest): Promise<DraftPaymentVerificationResponse> {
  const res = await fetch(`${API_BASE_URL}/payments/razorpay/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error('Payment verification failed. Please contact support if you were charged.');
  }

  return res.json();
}

function deriveLocalResult(data: ApplicationData): EligibilityResult {
  const { entity, financials } = data;
  const criteria = [];
  let overallPass = true;
  let hasReview = false;

  const regOk = Boolean(entity.registrationType);
  criteria.push({
    criterion: 'Entity Registration',
    status: regOk ? 'PASS' : 'FAIL',
    justification: regOk
      ? `Registered as ${entity.registrationType}.`
      : 'Registration type not specified.',
  } as const);
  if (!regOk) overallPass = false;

  const ownerOk = entity.indianOwnership >= 51;
  criteria.push({
    criterion: 'Ownership',
    status: ownerOk ? 'PASS' : 'FAIL',
    justification: ownerOk
      ? `Indian ownership at ${entity.indianOwnership}%.`
      : `Indian ownership is ${entity.indianOwnership}%, must be ≥ 51%.`,
  } as const);
  if (!ownerOk) overallPass = false;

  const locationOk = entity.location === 'Tamil Nadu';
  criteria.push({
    criterion: 'Location',
    status: locationOk ? 'PASS' : 'REVIEW',
    justification: locationOk
      ? 'Entity is based in Tamil Nadu.'
      : 'Entity is outside Tamil Nadu. TANSEED primarily targets TN startups.',
  } as const);
  if (!locationOk) hasReview = true;

  const profitOk = financials.avgProfit3y < 500000;
  criteria.push({
    criterion: 'Financial Cap',
    status: profitOk ? 'PASS' : 'FAIL',
    justification: profitOk
      ? `Avg profit ₹${financials.avgProfit3y.toLocaleString('en-IN')} is below ₹5L threshold.`
      : `Avg profit ₹${financials.avgProfit3y.toLocaleString('en-IN')} exceeds ₹5L cap.`,
  } as const);
  if (!profitOk) overallPass = false;

  const trlNote = financials.trlLevel >= 4 ? 'High weightage for funding.' : 'Low TRL may reduce score.';
  criteria.push({
    criterion: 'Innovation / TRL',
    status: financials.trlLevel >= 4 ? 'PASS' : 'REVIEW',
    justification: `TRL-${financials.trlLevel}. ${trlNote}`,
  } as const);
  if (financials.trlLevel < 4) hasReview = true;

  criteria.push({
    criterion: 'Priority Sector',
    status: 'INFO',
    justification: `${financials.prioritySector || 'Not specified'}. ${
      financials.prioritySector === 'Deep Tech/AI' || financials.prioritySector === 'Climate'
        ? '3% equity stake expected.'
        : ''
    }`,
  } as const);

  const status = !overallPass ? 'FAIL' : hasReview ? 'REVIEW' : 'PASS';

  return {
    status,
    ticketSize: status === 'PASS' ? '₹50L – ₹2Cr (based on sector & TRL)' : undefined,
    missingInfo: status === 'REVIEW' ? ['Location confirmation', 'TRL documentation'] : undefined,
    failReason: status === 'FAIL'
      ? criteria.filter((c) => c.status === 'FAIL').map((c) => c.criterion).join(', ')
      : undefined,
    criteria: criteria as EligibilityResult['criteria'],
  };
}

function generateLocalDraft(data: ApplicationData) {
  const { entity, financials } = data;
  return {
    executiveSummary: `${entity.entityName} is a ${entity.registrationType} startup registered in ${entity.location}, operating in the ${financials.prioritySector} sector. We seek TANSEED grant support to scale our innovation.`,
    marketOpportunity: `The ${financials.prioritySector} market presents a significant opportunity. Our technology addresses critical gaps with a current TRL of ${financials.trlLevel}, demonstrating strong readiness for commercialization.`,
    useOfFunds: `Grant funds will be deployed for R&D acceleration, prototype refinement, and market validation. The capital will directly advance our technology from TRL-${financials.trlLevel} to market-ready stage.`,
    impactStatement: `${entity.entityName} aims to create measurable impact in the ${financials.prioritySector} space across Tamil Nadu, creating employment and driving sustainable growth aligned with StartupTN's vision.`,
  };
}

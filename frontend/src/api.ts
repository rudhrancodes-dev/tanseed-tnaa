import type { ApplicationData, EligibilityResult } from './types';

export async function runEligibilityCheck(data: ApplicationData): Promise<EligibilityResult> {
  try {
    const res = await fetch('/api/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('API error');
    return res.json();
  } catch {
    // Fallback: derive result locally from form data
    return deriveLocalResult(data);
  }
}

export async function fetchDraft(data: ApplicationData) {
  try {
    const res = await fetch('/api/draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('API error');
    return res.json();
  } catch {
    return generateLocalDraft(data);
  }
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

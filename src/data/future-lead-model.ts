/**
 * Presentation-only contract for a future estimate workspace. No browser state
 * from the preview is sent, stored, or connected to this model in Phase 2.
 */
export const futureLeadStatuses = ['New', 'Contacted', 'Qualified', 'Site Visit / Estimate Needed', 'Handed to QuickBooks'] as const;
export const futureLeadTerminalStatuses = ['Not a Fit / Closed'] as const;

export type FutureLeadAttachment = {
  kind: 'photo' | 'document' | 'future-measurement-report';
  name: string;
  publicEligible?: boolean;
};

/**
 * Future lead-source contract. The preview only lets a visitor describe how
 * they heard about East Coast Foam; technical attribution remains a future
 * production concern and is deliberately not collected in this preview.
 */
export type FutureLeadAttribution = {
  declaredSource?: string;
  declaredSourceDetail?: string;
  landingPage?: string;
  referringDomain?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
};

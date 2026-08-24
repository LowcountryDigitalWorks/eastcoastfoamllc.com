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

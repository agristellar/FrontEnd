export function authContinuationQuery(input: Record<string, unknown>): Record<string, string> {
  if (input.chat === '1') return { chat: '1' };
  if (typeof input.rfq === 'string' && /^[a-f0-9]{24}$/.test(input.rfq)) return { rfq: input.rfq };
  return {};
}
export function rfqWorkspaceTarget(input: Record<string, unknown>, role: string): string | null {
  const query = authContinuationQuery(input);
  return query.rfq && ['Buyer','Supplier'].includes(role) ? '/workspace/rfqs/' + query.rfq : null;
}

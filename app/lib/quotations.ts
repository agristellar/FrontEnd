export const rfqLines = (rfq: any) => rfq?.lines?.length ? rfq.lines : rfq ? [{ lineId: 'legacy', product: rfq.product, specifications: '', quantity: rfq.quantity, unit: rfq.unit }] : [];
export const localDatetime = (value: string) => {
  if (!value || Number.isNaN(Date.parse(value))) return '';
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

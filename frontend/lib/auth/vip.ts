/** True when the user has an active VIP subscription. */
export function isActiveVip(vipExpiryDate: string | null | undefined): boolean {
  if (!vipExpiryDate) return false;
  const expiry = new Date(vipExpiryDate);
  if (Number.isNaN(expiry.getTime())) return false;
  return expiry.getTime() > Date.now();
}

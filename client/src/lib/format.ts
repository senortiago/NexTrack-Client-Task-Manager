export function calculateChargeDiscount(amountCents: number, discountPercentage: number): number {
  return Math.round(amountCents * (discountPercentage / 100));
}

export function calculateChargeFinal(amountCents: number, discountPercentage: number): number {
  const discount = calculateChargeDiscount(amountCents, discountPercentage);
  return amountCents - discount;
}

// Single source of truth for the shipping quantifier, shared by the
// cart page (to preview cost) and the checkout API (to charge it).
// All amounts in cents.

export const FLAT_SHIPPING = 500;            // $5.00 flat rate
export const FREE_SHIPPING_THRESHOLD = 4000; // free shipping at $40.00+

/** Shipping cost in cents for a given order subtotal (cents). */
export function shippingFor(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;
}

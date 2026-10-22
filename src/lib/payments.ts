/**
 * Phase 2 hook for online payments (Paystack, Flutterwave, Hubtel, etc.).
 * This version collects deposits by Mobile Money outside the app.
 * The booking row already has deposit_required / deposit_amount / deposit_received
 * and status pending_deposit → confirmed, so a gateway can be added without
 * rewriting the wizard.
 */
export type PaymentProvider = {
  startDeposit(bookingId: string): Promise<{ checkoutUrl: string }>;
};

export const inPersonPayment: PaymentProvider = {
  async startDeposit() {
    throw new Error(
      "Online payment is not enabled. The client pays in person; deposits use Mobile Money details shown on the confirmation page.",
    );
  },
};

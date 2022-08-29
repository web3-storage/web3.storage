export type StripePaymentMethodId = `pm_{string}`;
export type StripeCustomerId = string;

export type StripePaymentMethod = {
  id: StripePaymentMethodId
}

export interface BillingService {
  savePaymentMethod(
    customer: StripeCustomerId,
    paymentMethodId: StripePaymentMethodId
  ): Promise<void>;
}

export interface Customer {
  id: string
}

export interface CustomersService {
  getOrCreateForUser(user): Promise<Customer>
}

export type StripePaymentMethodId = `pm_${string}`;
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

export interface BillingUser {
  id: string
}

/**
 * interface of services related to billing.
 * Used in cf-worker-style request handlers
 */
export interface BillingEnv {
  billing: BillingService
  customers: CustomersService
}

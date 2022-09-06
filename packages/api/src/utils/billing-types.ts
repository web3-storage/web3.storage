export type StripePaymentMethodId = string;
export type CustomerId = string;

export type StripePaymentMethod = {
  id: StripePaymentMethodId
}

export type PaymentMethod = StripePaymentMethod

export interface BillingService {
  getPaymentMethod(customer: CustomerId): Promise<PaymentMethod>
  savePaymentMethod(
    customer: CustomerId,
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

export interface PaymentSettings {
  method: PaymentMethod
}

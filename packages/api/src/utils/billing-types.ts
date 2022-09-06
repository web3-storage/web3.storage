export type StripePaymentMethodId = string;
export type CustomerId = string;

export type StripeCardPaymentMethod = {
  id: `pm_${string}`
  card: {
    '@type': 'https://stripe.com/docs/api/cards/object'
    brand: string
    country: string | null
    exp_month: number
    exp_year: number
    funding: string
    last4: string
  }
}

export type IdOnlyPaymentMethod = {
  id: string
}

export type PaymentMethod = StripeCardPaymentMethod | IdOnlyPaymentMethod

export interface BillingService {
  getPaymentMethod(customer: CustomerId): Promise<PaymentMethod|null>
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
  method: null|PaymentMethod
}

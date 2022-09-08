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

/**
 * Indicates that a process was not able to find a specific Customer record.
 */
export interface CustomerNotFound extends Error {
  code: 'ERROR_CUSTOMER_NOT_FOUND'
}

export interface BillingService {
  getPaymentMethod(customer: CustomerId): Promise<PaymentMethod|null|CustomerNotFound>
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

export interface UserCustomerService {
  getUserCustomer: (userId: string) => Promise<null|{ id: string }>
  upsertUserCustomer: (userId: string, customerId: string) => Promise<any>
}

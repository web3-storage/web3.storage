import { StripePriceId } from "./stripe";

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

export interface CustomerContact {
  email: string | undefined
  name: string | undefined
}

export interface CustomersService {
  /**
   * Get contact info for the a customer.
   * @param customerId - customer id to get contact info of
   */
  getContact(customerId: Customer['id']): Promise<CustomerContact|CustomerNotFound>
  updateContact(customerId: Customer['id'], contact: CustomerContact): Promise<CustomerNotFound|void>
  getOrCreateForUser(user: BillingUser, userCreationOptions?: UserCreationOptions): Promise<Pick<Customer, 'id'>>
  getForUser(user: BillingUser): Promise<Pick<Customer, 'id'>|null>
}

export type StoragePriceName = 'free' | 'lite' | 'pro'

export interface PriceTier {
  flatAmount: number | null;
  unitAmount: number | null;
  upTo: number | null;
}

export interface CustomStoragePrice {
  id: string;
  // Monthly bandwidth in GiB
  bandwidth?: number;
  label: string;
  // True if price is prioritized.  It could be used to disable selection of alternative prices.
  isPreferred: boolean;
  description?: string;
  tiers: Array<PriceTier> | null;
}

export type StoragePrice = StoragePriceName | CustomStoragePrice;

/**
 * A subscription to the web3.storage platform.
 * This may be a composition of several product-specific subscriptions.
 */
export interface W3PlatformSubscription {
  // details of subscription to storage functionality
  storage: null | {
    // the price that should be used to determine the subscription's periodic invoice/credit.
    price: StoragePrice
  }
}

export type NamedStripePrices = {
  priceToName: (priceId: string) => undefined | StoragePriceName
  nameToPrice: (name: StoragePriceName) => undefined | StripePriceId
}

/**
 * storage subscription that is stored in stripe.com
 */
export interface W3StorageStripeSubscription {
  id: string
}

/**
 * Keeps track of the subscription a customer has chosen to pay for web3.storage services
 */
export interface SubscriptionsService {
  getSubscription(customer: CustomerId): Promise<W3PlatformSubscription|CustomerNotFound>
  saveSubscription(customer: CustomerId, subscription: W3PlatformSubscription): Promise<void|CustomerNotFound>
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
  subscriptions: SubscriptionsService
  agreements: AgreementService
}

export type PaymentSettings = {
  paymentMethod: null | PaymentMethod
  subscription: W3PlatformSubscription
  agreement?: Agreement
}

export interface UserCustomerService {
  getUserCustomer: (userId: string) => Promise<null|{ id: string }>
  upsertUserCustomer: (userId: string, customerId: string) => Promise<void>
}

export interface AgreementService {
  createUserAgreement: (userId: string, agreement: Agreement) => Promise<void>
}

export interface UserCreationOptions {
  email?: string
  name?: string
}

export type Agreement = 'web3.storage-tos-v1'

/**
 * Command instructing system to update the web3.storage subscription for a user
 */
export interface UpdateSubscriptionCommand {
  agreement: Agreement
  paymentMethod: Pick<PaymentMethod, 'id'>
  subscription: W3PlatformSubscription
}

/**
 * Command instructing system to update the default paymentMethod for a user.
 * It will not update the payment method of old subscriptions.
 */
export interface UpdateDefaultPaymentMethodCommand {
  paymentMethod: Pick<PaymentMethod, 'id'>
}

export type SavePaymentSettingsCommand = UpdateSubscriptionCommand | UpdateDefaultPaymentMethodCommand

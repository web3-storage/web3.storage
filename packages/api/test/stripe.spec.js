/* eslint-env mocha */
import assert from 'assert'
import { createStripe, StripeBillingService, StripeCustomersService } from '../src/utils/stripe.js'

describe('StripeBillingService', async function () {
  it('can savePaymentMethod', async function () {
    const customerId = `customer-${Math.random().toString().slice(2)}`
    const paymentMethodId = /** @type const */ (`pm_${Math.random().toString().slice(2)}`)
    const billing = StripeBillingService.create()
    await billing.savePaymentMethod(customerId, paymentMethodId)
  })
})

describe('StripeCustomersService', async function () {
  it('can getOrCreateForUser', async function () {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    if (!stripeSecretKey) {
      console.warn('skipping test that requires STRIPE_SECRET_KEY')
      return
    }
    const userId = `user-${Math.random().toString().slice(2)}`
    /** @type {import('../src/utils/stripe.js').StripeComForCustomersService} */
    const mockStripe = {
      customers: {
        // @ts-ignore
        create: async () => {
          const customer = createMockStripeCustomer()
          return customer
        },
        // @ts-ignore
        search: (params, options) => {
          const data = [createMockStripeCustomer()]
          const response = { data }
          const promise = Promise.resolve(response)
          return promise
        }
      }
    }
    const stripe = createStripe(process.env.STRIPE_SECRET_KEY ?? '')
    const customers = StripeCustomersService.create(stripe)
    const user = { id: userId }
    // console.log('about to getOrCreateForUser c1')
    const c1 = await customers.getOrCreateForUser(user)
    assert.ok(c1)
    assert.ok(mockStripe)
    // console.log('about to getOrCreateForUser c2')
    // const c2 = await customers.getOrCreateForUser(user)
    // assert.equal(c1, c2, 'returns same customer for same user')
  })
})

function createMockStripeCustomer () {
  return {
    id: `customer-${Math.random().toString().slice(2)}`
  }
}

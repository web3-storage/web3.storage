/* eslint-env mocha */
import assert from 'assert'
import { StripeBillingService, StripeCustomersService } from '../src/utils/stripe.js'

describe('StripeBillingService', async function () {
  it('can savePaymentMethod', async function () {
    const customerId = `customer-${Math.random().toString().slice(2)}`
    const paymentMethodId = /** @type const */ (`pm_${Math.random().toString().slice(2)}`)
    const billing = StripeBillingService.create()
    await billing.savePaymentMethod(customerId, paymentMethodId)
  })
})

describe('StripeCustomersService', async function () {
  it.skip('can getOrCreateForUser', async function () {
    const userId = `user-${Math.random().toString().slice(2)}`
    const customers = StripeCustomersService.create()
    const c1 = await customers.getOrCreateForUser(userId)
    const c2 = await customers.getOrCreateForUser(userId)
    assert.equal(c1, c2, 'returns same customer for same user')
  })
})

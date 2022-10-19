import * as url from 'node:url';
import { createStripeFromEnv } from "../utils/stripe.js";
import stripeFixtures from "./fixtures.json" assert { type: "json" };
import fetch from "@web-std/fetch";
import assert from "node:assert";
import Stripe from "stripe";

/**
 * @typedef {import('src/utils/billing-types.js').StoragePriceName} StoragePriceName
 */

/**
 * @typedef {import('stripe').Stripe.Product} StripeProduct
 */

/**
 * @typedef {import('stripe').Stripe.Price} StripePrice
 */

/**
 * @typedef ProductFixture
 * @property {StripeProduct['name']} name
 * @property {StripeProduct['description']} description
 * @property {StripeProduct['metadata'] & { uuid: string }} metadata
 * @property {StripeProduct['unit_label']} unit_label
 * @property {StripeProduct['url']} url
 */

/** @type {ProductFixture} */
const storageProduct = {
  name: "web3.storage",
  description: "storage on https://web3.storage",
  metadata: {
    uuid: "16967d49-6708-4298-b08e-41d078345b9e"
  },
  unit_label: "GiB * mo",
  url: "https://web3.storage"
}

/**
 * @typedef PriceFixture
 * @property {StripePrice['billing_scheme']} billing_scheme
 * @property {StripePrice['product']} product
 * @property {StripePrice['metadata'] & { uuid: string }} metadata
 * @property {StripePrice['nickname']} nickname
 * @property {Exclude<StripePrice['recurring'], null>} recurring
 * @property {StripePrice['tiers_mode']} tiers_mode
 * @property {StripePrice['currency']} currency
 * @property {Stripe.PriceUpdateParams.CurrencyOptions['tiers']} tiers
 */

/**
 * @param {StripeProduct['id']} storageProductId
 * @returns {Record<'free', PriceFixture>} 
 */
function createPriceFixtures(storageProductId) {
  return {
    free: {
      billing_scheme: "tiered",
      metadata: {
        "Bandwidth": " 10GiB / month",
        "Block Limits": " 2,500 / GiB",
        "CAR Size Limit": "5MiB",
        "Name": "Free",
        "uuid": "a258e911-b72d-48c0-9949-320495cd4c2d"
      },
      nickname: 'free',
      product: storageProductId,
      "recurring": {
        "aggregate_usage": "max",
        "interval": "month",
        "interval_count": 1,
        "trial_period_days": null,
        "usage_type": "metered"
      },
      "tiers_mode": "graduated",
      "currency": "usd",
      "tiers": [
        {
          "flat_amount": 0,
          "unit_amount": 0,
          "up_to": 5
        },
        {
          "flat_amount": 0,
          "unit_amount": 20,
          "up_to": "inf"
        }
      ]
    },
    // lite: {
    //   product: storageProductId
    // },
    // pro: {
    //   product: storageProductId
    // }
  }
}

async function main() {
  const stripe = createStripeFromEnv(process.env, /** @type {typeof globalThis.fetch } */ (fetch));
  await putWeb3StorageStripeFixtures(stripe);
}

/**
 * 
 * @param {import('stripe').Stripe} stripe 
 */
async function putWeb3StorageStripeFixtures(stripe) {
  const storageProductPersisted = await createOrUpdateProductFixture(stripe, storageProduct)
  const priceFixtures = createPriceFixtures(storageProductPersisted.id)
  const pricesPersisted = await Promise.all(Object.values(priceFixtures).map(priceFixture => createOrUpdatePriceFixture(stripe, priceFixture)))
  console.log({ storageProductPersisted, pricesPersisted })
}

/**
 * @param {import('stripe').Stripe} stripe 
 * @param {string} uuid
 * @returns {Promise<StripeProduct|null>}
 */
async function fetchProductByUuid(stripe, uuid) {
  const storageProductSearchResults = await stripe.products.search({ query: `metadata["uuid"]:"${uuid}"` })
  const storageProductFetched = storageProductSearchResults?.data?.[0]
  return storageProductFetched ?? null
}

/**
 * @param {import('stripe').Stripe} stripe 
 * @param {string} uuid
 * @returns {Promise<StripePrice|null>}
 */
 async function fetchPriceByUuid(stripe, uuid) {
  const pricesSearchResults = await stripe.prices.search({ query: `metadata["uuid"]:"${uuid}"` })
  const price = pricesSearchResults?.data?.[0]
  return price ?? null
}

/**
 * @param {import('stripe').Stripe} stripe 
 * @param {ProductFixture} productFixture
 */
async function createOrUpdateProductFixture(stripe, productFixture) {
  const existingProduct = await fetchProductByUuid(stripe, productFixture.metadata.uuid)
  return await createOrUpdateProduct(stripe, existingProduct?.id ?? null, productFixture)
}

/**
 * @param {import('stripe').Stripe} stripe 
 * @param {string|null} existingProductId
 * @param {ProductFixture} product
 * @returns {Promise<{ id: string }>}
 */
async function createOrUpdateProduct(stripe, existingProductId, product) {
  const productForApi = {
    ...product,
    description: product.description ?? undefined,
    unit_label: product.unit_label ?? undefined,
    url: product.url ?? undefined,
  }
  if (existingProductId) {
    return await stripe.products.update(existingProductId, productForApi)
  }
  return await stripe.products.create(productForApi)
}

/**
 * @param {import('stripe').Stripe} stripe 
 * @param {string|null} existingPriceId
 * @param {PriceFixture} price
 * @returns {Promise<{ id: string }>}
 */
 async function createOrUpdatePrice(stripe, existingPriceId, price) {
  const priceForApi = {
    ...price,
    nickname: price.nickname ?? undefined,
    tiers_mode: price.tiers_mode ?? undefined,
    recurring: {
      ...price.recurring,
      interval: price.recurring?.interval ?? undefined,
      aggregate_usage: price.recurring?.aggregate_usage ?? undefined,
      trial_period_days: price.recurring?.trial_period_days ?? undefined,
    },
    product: (typeof price.product === 'object') ? price.product.id : price.product,
  }
  if (existingPriceId) {
    return await stripe.prices.update(existingPriceId, priceForApi)
  }
  return await stripe.prices.create(priceForApi)
}

/**
 * @param {import('stripe').Stripe} stripe 
 * @param {PriceFixture} priceFixture
 * @returns {Promise<{ id: string }>}
 */
async function createOrUpdatePriceFixture(stripe, priceFixture) {
  const existingPrice = await fetchPriceByUuid(stripe, priceFixture.metadata.uuid)
  const price = await createOrUpdatePrice(stripe, existingPrice?.id ?? null, priceFixture)
  return price;
}

// run main when this module is executed directly
if (process.argv[1] === url.fileURLToPath(import.meta.url)) {
  await main();
}

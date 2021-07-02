import { GraphQLClient, gql } from 'graphql-request'

const ENDPOINT = 'https://graphql.fauna.com/graphql'

export { gql }

export class DBClient {
  constructor ({ endpoint = ENDPOINT, token }) {
    this._client = new GraphQLClient(endpoint, {
      fetch: globalThis.fetch,
      headers: { Authorization: `Bearer ${token}` }
    })
  }

  /**
   * @template T
   * @template V
   * @param {import('graphql-request').RequestDocument} document
   * @param {V} variables
   * @returns {Promise<T>}
   */
  query (document, variables) {
    return this._client.request(document, variables)
  }
}

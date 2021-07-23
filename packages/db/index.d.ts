import { gql } from 'graphql-request'
import { RequestDocument } from 'graphql-request/dist/types'

export { gql }

export class DBClient {
  constructor(config: { endpoint?: string; token: string })
  query<T, V>(document: RequestDocument, variables: V): Promise<T>
}

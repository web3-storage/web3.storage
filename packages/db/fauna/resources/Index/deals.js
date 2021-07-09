import fauna from 'faunadb'

const {
  CreateIndex,
  Collection,
  If,
  Index,
  Exists,
  Not
} = fauna

/**
 * Usage:
 *
 * Match(
 *   Index('deals'),
 *   StatusString // Queued, Proposing, Accepted, Active, Terminated
 * )
 */
const index = {
  name: 'deals',
  source: Collection('Deal'),
  terms: [
    { field: ['data', 'status'] }
  ],
  values: [
    { field: ['data', 'status'] }
  ]
}

// indexes cannot be updated
export default If(
  Not(Exists(Index(index.name))),
  CreateIndex(index),
  Index(index.name)
)

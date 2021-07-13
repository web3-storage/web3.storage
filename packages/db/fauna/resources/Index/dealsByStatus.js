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
 *   Index('deals_by_status'),
 *   StatusString // Queued, Proposing, Accepted, Active, Terminated
 * )
 */
const index = {
  name: 'deals_by_status',
  source: Collection('Deal'),
  terms: [
    { field: ['data', 'status'] }
  ]
}

// indexes cannot be updated
export default If(
  Not(Exists(Index(index.name))),
  CreateIndex(index),
  Index(index.name)
)

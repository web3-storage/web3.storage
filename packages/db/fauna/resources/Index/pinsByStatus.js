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
 *   Index('pins_by_status'),
 *   StatusString // Pinned, Pinning, PinQueued, ...
 * )
 */
const index = {
  name: 'pins_by_status',
  source: Collection('Pin'),
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

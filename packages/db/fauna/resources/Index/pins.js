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
 *   Index('pins'),
 *   StatusString // Pinned, Pinning, PinQueued, ...
 * )
 */
const index = {
  name: 'pins',
  source: Collection('Pin'),
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

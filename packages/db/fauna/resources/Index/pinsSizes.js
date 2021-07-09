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
 *   Index('pins_sizes'),
 *   StatusString // Pinned, Pinning, PinQueued, ...
 * )
 */
const index = {
  name: 'pins_sizes',
  source: [
    Collection('Pin')
  ],
  terms: [
    { field: ['data', 'status'] }
  ],
  values: [
    { field: ['data', 'content', 'data', 'dagSize'] }
  ]
}

// indexes cannot be updated
export default If(
  Not(Exists(Index(index.name))),
  CreateIndex(index),
  Index(index.name)
)

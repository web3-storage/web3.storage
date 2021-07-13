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
 *   Index('pins_content_by_status'),
 *   StatusString // Pinned, Pinning, PinQueued, ...
 * )
 */
const index = {
  name: 'pins_content_by_status',
  source: Collection('Pin'),
  terms: [
    { field: ['data', 'status'] }
  ],
  values: [
    { field: ['data', 'content'] }
  ]
}

// indexes cannot be updated
export default If(
  Not(Exists(Index(index.name))),
  CreateIndex(index),
  Index(index.name)
)

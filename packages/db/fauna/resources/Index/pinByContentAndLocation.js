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
 *   Index('pin_by_content_and_location'),
 *   Ref(Collection('Content'), Var('contentId'))
 *   Ref(Collection('PinLocation'), Var('locationId'))
 * )
 */
const index = {
  name: 'pin_by_content_and_location',
  source: Collection('Pin'),
  terms: [
    { field: ['data', 'content'] },
    { field: ['data', 'location'] }
  ]
}

// indexes cannot be updated
export default If(
  Not(Exists(Index(index.name))),
  CreateIndex(index),
  Index(index.name)
)

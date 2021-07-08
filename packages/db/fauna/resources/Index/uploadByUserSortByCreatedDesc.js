import fauna from 'faunadb'

const {
  CreateIndex,
  Collection,
  If,
  Index,
  Exists,
  Not,
  Query,
  Lambda,
  Equals,
  Select,
  Var
} = fauna

/**
 * Usage:
 *
 * Match(
 *   Index('upload_by_user_sort_by_created_desc'),
 *   Ref(Collection('user'), Var('id')),
 *   true // not_deleted
 * )
 */
const index = {
  name: 'upload_by_user_sort_by_created_desc',
  source: [{
    collection: Collection('Upload'),
    fields: {
      not_deleted: Query(
        Lambda(
          'upload',
          Equals(Select(['data', 'deleted'], Var('upload'), null), null)
        )
      )
    }
  }],
  terms: [
    { field: ['data', 'user'] },
    { binding: 'not_deleted' }
  ],
  values: [
    { field: ['data', 'created'], reverse: true },
    { field: 'ref' }
  ]
}

// indexes cannot be updated
export default If(
  Not(Exists(Index(index.name))),
  CreateIndex(index),
  Index(index.name)
)

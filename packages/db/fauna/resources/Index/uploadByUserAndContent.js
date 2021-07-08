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
 *   Index('upload_by_user_and_content'),
 *   Ref(Collection('user'), Var('id')),
 *   Ref(Collection('content'), Var('id')),
 *   true // not_deleted
 * )
 */
const index = {
  name: 'upload_by_user_and_content',
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
    { field: ['data', 'content'] },
    { binding: 'not_deleted' }
  ]
}

// indexes cannot be updated
export default If(
  Not(Exists(Index(index.name))),
  CreateIndex(index),
  Index(index.name)
)

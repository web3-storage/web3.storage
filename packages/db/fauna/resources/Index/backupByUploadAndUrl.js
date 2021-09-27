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
 *   Index('backup_by_upload_and_url'),
 *   Ref(Collection('Upload'), Var('uploadId')),
 *   Var('url')
 * )
 */
const index = {
  name: 'backup_by_upload_and_url',
  source: Collection('Backup'),
  terms: [
    { field: ['data', 'upload'] },
    { field: ['data', 'url'] }
  ]
}

// indexes cannot be updated
export default If(
  Not(Exists(Index(index.name))),
  CreateIndex(index),
  Index(index.name)
)

import fauna from 'faunadb'

const {
  Function,
  CreateFunction,
  Query,
  Lambda,
  Select,
  Var,
  If,
  Create,
  Update,
  Exists,
  Now
} = fauna

const name = 'createBatch'
const body = Query(
  Lambda(
    ['data'],
    Create('Batch', {
      data: {
        cid: Select('batchCid', Var('data')),
        pieceCid: Select('pieceCid', Var('data')),
        created: Now()
      }
    })
  )
)

export default If(
  Exists(Function(name)),
  Update(Function(name), { name, body }),
  CreateFunction({ name, body })
)

import fauna from 'faunadb'

const {
  Function,
  CreateFunction,
  Query,
  Lambda,
  Var,
  If,
  Update,
  Exists,
  Map,
  Collection,
  Ref,
  Call
} = fauna

const name = 'deletePinSyncRequests'
const body = Query(
  Lambda(
    ['requests'],
    Map(
      Var('requests'),
      Lambda('id', Call('deleteWithHistory', Ref(Collection('PinSyncRequest'), Var('id'))))
    )
  )
)

export default If(
  Exists(Function(name)),
  Update(Function(name), { name, body }),
  CreateFunction({ name, body })
)

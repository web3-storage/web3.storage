import fauna from 'faunadb'

const {
  Function,
  CreateFunction,
  Query,
  Lambda,
  Let,
  Var,
  If,
  Create,
  Update,
  Exists,
  Now,
  Abort,
  Map,
  Not,
  Collection,
  Ref
} = fauna

const name = 'createPinSyncRequests'
const body = Query(
  Lambda(
    ['pins'],
    Map(
      Var('pins'),
      Lambda(
        ['id'],
        Let(
          {
            pinRef: Ref(Collection('Pin'), Var('id'))
          },
          If(
            Not(Exists(Var('pinRef'))),
            Abort('missing pin'),
            Create('PinSyncRequest', {
              data: {
                pin: Var('pinRef'),
                created: Now()
              }
            })
          )
        )
      )
    )
  )
)

export default If(
  Exists(Function(name)),
  Update(Function(name), { name, body }),
  CreateFunction({ name, body })
)

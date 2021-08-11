import fauna from 'faunadb'

const {
  Function,
  CreateFunction,
  Query,
  Lambda,
  Select,
  Var,
  If,
  Update,
  Exists,
  Map,
  Ref,
  Collection,
  Now
} = fauna

const name = 'updatePins'
const body = Query(
  Lambda(
    ['pins'],
    Map(
      Var('pins'),
      Lambda(
        'data',
        Update(
          Ref(Collection('Pin'), Select('pin', Var('data'))),
          {
            data: {
              status: Select('status', Var('data')),
              updated: Now()
            }
          }
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

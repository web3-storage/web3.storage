import fauna from 'faunadb'

const {
  Function,
  CreateFunction,
  Query,
  Lambda,
  Let,
  Var,
  If,
  Update,
  Exists,
  Ref,
  Collection,
  Get,
  Add,
  Select
} = fauna

const name = 'incrementPinRequestAttempts'
const body = Query(
  Lambda(
    ['id'],
    Let(
      {
        pinRequestRef: Ref(Collection('PinRequest'), Var('id')),
        pinRequest: Get(Var('pinRequestRef'))
      },
      Update(Var('pinRequestRef'), {
        data: {
          attempts: Add(Select(['data', 'attempts'], Var('pinRequest')), 1)
        }
      })
    )
  )
)

export default If(
  Exists(Function(name)),
  Update(Function(name), { name, body }),
  CreateFunction({ name, body })
)

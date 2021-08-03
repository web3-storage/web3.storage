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

const name = 'incrementUserUsedStorage'
const body = Query(
  Lambda(
    ['userId', 'amount'],
    Let(
      {
        userRef: Ref(Collection('User'), Var('userId')),
        usedStorage: Select(['data', 'usedStorage'], Get(Var('userRef')), 0)
      },
      Update(Var('userRef'), {
        data: {
          usedStorage: Add(Var('usedStorage'), Var('amount'))
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

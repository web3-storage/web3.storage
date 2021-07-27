import fauna from 'faunadb'

const {
  Function,
  CreateFunction,
  Query,
  Lambda,
  Select,
  Collection,
  Let,
  Get,
  Ref,
  Var,
  Exists,
  If,
  Update
} = fauna

const name = 'findStorageByUser'

const body = Query(
  Lambda(
    ['user'],
    Let(
      {
        user: Ref(Collection('User'), Var('user'))
      },
      {
        data: {
          usedStorage: Select(
            ['data', 'usedStorage'],
            Get(Var('user')),
            0
          )
        }
      }
    )
  )
)

export default If(
  Exists(Function(name)),
  Update(Function(name), { name, body }),
  CreateFunction({ name, body })
)

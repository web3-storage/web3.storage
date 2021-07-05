import fauna from 'faunadb'

const {
  Function,
  CreateFunction,
  Query,
  Lambda,
  Let,
  Select,
  Var,
  If,
  Create,
  Update,
  Exists,
  Now,
  Ref,
  Abort,
  Collection
} = fauna

const name = 'createAuthToken'
const body = Query(
  Lambda(
    ['data'],
    Let(
      {
        user: Ref(Collection('User'), Select('user', Var('data'))),
        name: Select('name', Var('data')),
        secret: Select('secret', Var('data'))
      },
      If(
        Exists(Var('user')),
        Create('AuthToken', {
          data: {
            user: Var('user'),
            name: Var('name'),
            secret: Var('secret'),
            created: Now()
          }
        }),
        Abort('user not found')
      )
    )
  )
)

export default If(
  Exists(Function(name)),
  Update(Function(name), { name, body }),
  CreateFunction({ name, body })
)

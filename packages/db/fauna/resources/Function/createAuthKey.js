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
} = fauna

const name = 'createAuthKey'
const body = Query(
  Lambda(
    ['data'],
    Let(
      {
        user: Ref('User', Select('user', Var('data'))),
        name: Select('name', Var('data')),
        secret: Select('secret', Var('data')),
      },
      If(
        Exists(Var('user')),
        Create('AuthKey', {
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

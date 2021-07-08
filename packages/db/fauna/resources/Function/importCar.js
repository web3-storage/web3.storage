import fauna from 'faunadb'

const {
  Function,
  CreateFunction,
  Query,
  Lambda,
  Let,
  Match,
  Index,
  Select,
  Var,
  If,
  Create,
  Update,
  Exists,
  Now,
  Get,
  Ref,
  IsNonEmpty,
  Abort,
  Collection
} = fauna

const name = 'importCar'
const body = Query(
  Lambda(
    ['data'],
    Let(
      {
        authTokenRef: Ref(Collection('AuthToken'), Select('authToken', Var('data'))),
        cid: Select('cid', Var('data')),
        contentMatch: Match(Index('unique_Content_cid'), Var('cid'))
      },
      If(
        Exists(Var('authTokenRef')),
        If(
          IsNonEmpty(Var('contentMatch')),
          Create('Upload', {
            data: {
              user: Select(['data', 'user'], Get(Var('authTokenRef'))),
              authToken: Var('authTokenRef'),
              cid: Var('cid'),
              content: Select('ref', Get(Var('contentMatch'))),
              created: Now(),
              name: Select('name', Var('data'), null)
            }
          }),
          Let(
            {
              content: Create('Content', {
                data: {
                  cid: Var('cid'),
                  dagSize: Select('dagSize', Var('data'), null),
                  created: Now()
                }
              })
            },
            Create('Upload', {
              data: {
                user: Select(['data', 'user'], Get(Var('authTokenRef'))),
                authToken: Var('authTokenRef'),
                cid: Var('cid'),
                content: Select('ref', Var('content')),
                created: Now(),
                name: Select('name', Var('data'), null)
              }
            })
          )
        ),
        Abort('auth key not found')
      )
    )
  )
)

export default If(
  Exists(Function(name)),
  Update(Function(name), { name, body }),
  CreateFunction({ name, body })
)

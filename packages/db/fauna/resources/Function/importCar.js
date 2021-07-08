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
        authTokenRef: Ref(Collection('AuthToken'), Select('authToken', Var('data')))
      },
      If(
        Exists(Var('authTokenRef')),
        Let(
          {
            cid: Select('cid', Var('data')),
            contentMatch: Match(Index('unique_Content_cid'), Var('cid')),
            userRef: Select(['data', 'user'], Get(Var('authTokenRef')))
          },
          If(
            IsNonEmpty(Var('contentMatch')),
            Let(
              {
                content: Get(Var('contentMatch')),
                uploadMatch: Match(
                  Index('upload_by_user_and_content'),
                  Var('userRef'),
                  Select('ref', Var('content')),
                  true
                )
              },
              If(
                IsNonEmpty(Var('uploadMatch')),
                Get(Var('uploadMatch')),
                Create('Upload', {
                  data: {
                    user: Var('userRef'),
                    authToken: Var('authTokenRef'),
                    cid: Var('cid'),
                    content: Select('ref', Var('content')),
                    name: Select('name', Var('data'), null),
                    created: Now()
                  }
                })
              )
            ),
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
                  user: Var('userRef'),
                  authToken: Var('authTokenRef'),
                  cid: Var('cid'),
                  content: Select('ref', Var('content')),
                  name: Select('name', Var('data'), null),
                  created: Now()
                }
              })
            )
          )
        ),
        Abort('auth token not found')
      )
    )
  )
)

export default If(
  Exists(Function(name)),
  Update(Function(name), { name, body }),
  CreateFunction({ name, body })
)

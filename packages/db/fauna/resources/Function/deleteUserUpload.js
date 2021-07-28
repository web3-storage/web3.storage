import fauna from 'faunadb'

const {
  Function,
  CreateFunction,
  Query,
  Lambda,
  Let,
  Var,
  If,
  Do,
  Update,
  Exists,
  Now,
  Ref,
  Abort,
  Collection,
  Get,
  Match,
  IsNonEmpty,
  IsNumber,
  Select,
  Index,
  Subtract
} = fauna

const name = 'deleteUserUpload'
const body = Query(
  Lambda(
    ['userId', 'cid'],
    Let(
      {
        userRef: Ref(Collection('User'), Var('userId')),
        contentMatch: Match(Index('unique_Content_cid'), Var('cid'))
      },
      If(
        IsNonEmpty(Var('contentMatch')),
        Let(
          {
            content: Get(Var('contentMatch')),
            dagSize: Select(['data', 'dagSize'], Var('content'))
          },
          If(
            IsNumber(Var('dagSize')),
            Let(
              {
                uploadMatch: Match(
                  Index('upload_by_user_and_content'),
                  Var('userRef'),
                  Select('ref', Var('content')),
                  true
                )
              },
              If(
                IsNonEmpty(Var('uploadMatch')),
                Do(
                  // Update user storage size
                  Update(Var('userRef'), {
                    data: {
                      usedStorage: Subtract(
                        Select(['data', 'usedStorage'], Get(Var('userRef'))),
                        Var('dagSize')
                      )
                    }
                  }),
                  // Flag upload as deleted
                  Update(
                    Select(['ref'], Get(Var('uploadMatch'))),
                    { data: { deleted: Now() } }
                  )
                ),
                Abort('upload not found')
              )
            ),
            Abort('dagSize not yet calculated')
          )
        ),
        Abort('not found')
      )
    )
  )
)

export default If(
  Exists(Function(name)),
  Update(Function(name), { name, body }),
  CreateFunction({ name, body })
)

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
  Now,
  Ref,
  Abort,
  Collection,
  Get,
  Match,
  IsNonEmpty,
  Select,
  Index
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
            uploadMatch: Match(
              Index('upload_by_user_and_content'),
              Var('userRef'),
              Select('ref', Var('content')),
              true
            )
          },
          If(
            IsNonEmpty(Var('uploadMatch')),
            Update(
              Select(['ref'], Get(Var('uploadMatch'))),
              { data: { deleted: Now() } }
            ),
            Abort('not found')
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

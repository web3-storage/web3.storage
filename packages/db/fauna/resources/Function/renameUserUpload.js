import fauna from 'faunadb'

const {
  Abort,
  Collection,
  CreateFunction,
  Exists,
  Function,
  Get,
  If,
  Index,
  IsNonEmpty,
  Lambda,
  Let,
  Match,
  Query,
  Ref,
  Select,
  Update,
  Var
} = fauna

const name = 'renameUserUpload'
const body = Query(
  Lambda(
    ['userId', 'cid', 'name'],
    Let(
      {
        userRef: Ref(Collection('User'), Var('userId')),
        contentMatch: Match(Index('unique_Content_cid'), Var('cid'))
      },
      If(
        IsNonEmpty(Var('contentMatch')),
        Let(
          {
            content: Get(Var('contentMatch'))
          },
          Let(
            {
              uploadMatch: Match(
                Index('upload_by_user_and_content'),
                Var('userRef'),
                Select('ref', Var('content')),
                true
              )
            },
            If(IsNonEmpty(Var('uploadMatch')),
              Update(
                Select(['ref'], Get(Var('uploadMatch'))),
                { data: { name: Var('name') } }
              ),
              Abort('upload not found')
            )
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

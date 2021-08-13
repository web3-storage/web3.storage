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
  IsEmpty,
  Select,
  Index
} = fauna

const name = 'deleteUploadByUserAndContent'
const body = Query(
  Lambda(
    ['userId', 'contentId'],
    Let(
      {
        userRef: Ref(Collection('User'), Var('userId')),
        contentRef: Ref(Collection('Content'), Var('contentId')),
        uploadMatch: Match(
          Index('upload_by_user_and_content'),
          Var('userRef'),
          Var('contentRef'),
          true
        )
      },
      If(
        IsEmpty(Var('uploadMatch')),
        Abort('upload not found'),
        Update(
          Select(['ref'], Get(Var('uploadMatch'))),
          { data: { deleted: Now() } }
        )
      )
    )
  )
)

export default If(
  Exists(Function(name)),
  Update(Function(name), { name, body }),
  CreateFunction({ name, body })
)

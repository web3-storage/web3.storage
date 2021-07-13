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
  Equals,
  Select
} = fauna

const name = 'deleteUserUpload'
const body = Query(
  Lambda(
    ['userId', 'uploadId'],
    Let(
      {
        uploadRef: Ref(Collection('Upload'), Var('uploadId'))
      },
      If(
        // make sure the upload exists
        Exists(Var('uploadRef')),
        If(
          // make sure the user owns this upload
          Equals(
            Select(['data', 'user', 'id'], Get(Var('uploadRef'))),
            Var('userId')
          ),
          Update(Var('uploadRef'), { data: { deleted: Now() } }),
          Abort('unauthorized')
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

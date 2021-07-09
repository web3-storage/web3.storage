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
    ['uploadId', 'authTokenId'],
    Let(
      {
        authTokenRef: Ref(Collection('AuthToken'), Var('authTokenId')),
        uploadRef: Ref(Collection('Upload'), Var('uploadId')),
      },
      If(
        // make sure the token exists
        Exists(Var('authTokenRef')),
        If(
          // make sure the user owns this upload
          Equals(
            Select(['data', 'authToken', 'id'], Get(Var('uploadRef'))),
            Var('authTokenId')
          ),
          Update(Var('uploadRef'), { data: { deleted: Now() }}),
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

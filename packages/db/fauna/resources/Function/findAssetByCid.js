import fauna from 'faunadb'

const {
  Function,
  CreateFunction,
  Query,
  Lambda,
  Match,
  Index,
  Var,
  Get,
  Exists,
  If,
  Update
} = fauna

const name = 'findAssetByCid'
const body = Query(
  Lambda(
    ["cid"],
    Get(
      Match(
        Index("unique_Asset_cid"),
        Var("cid")
      )
    )
  )
)

export default If(
  Exists(Function(name)),
  Update(Function(name), { name, body }),
  CreateFunction({ name, body })
)

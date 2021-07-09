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
  IsEmpty,
  Create,
  Update,
  Exists,
  Merge,
  Now,
  Get
} = fauna

const name = 'createOrUpdateDeal'
const body = Query(
  Lambda(
    ['data'],
    Let(
      {
        match: Match(
          Index('deal_by_batch'),
          Select('issuer', Var('data'))
        )
      },
      If(
        IsEmpty(Var('match')),
        Create('User', { data: Merge(Var('data'), { created: Now() }) }),
        Update(Select('ref', Get(Var('match'))), { data: Var('data') })
      )
    )
  )
)

export default If(
  Exists(Function(name)),
  Update(Function(name), { name, body }),
  CreateFunction({ name, body })
)

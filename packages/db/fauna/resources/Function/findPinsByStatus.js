import fauna from 'faunadb'

const {
  Function,
  CreateFunction,
  Query,
  Lambda,
  Match,
  Index,
  Var,
  Exists,
  If,
  Update,
  Paginate,
  Map,
  Get,
  Equals,
  Let,
  Union
} = fauna

const name = 'findPinsByStatus'
const body = Query(
  Lambda(
    ['statuses', 'size', 'after', 'before'],
    Let(
      {
        match: Union(
          Map(
            Var('statuses'),
            Lambda('status', Match(Index('pin_by_status'), Var('status')))
          )
        ),
        page: If(
          Equals(Var('before'), null),
          If(
            Equals(Var('after'), null),
            Paginate(Var('match'), { size: Var('size') }),
            Paginate(Var('match'), { size: Var('size'), after: Var('after') })
          ),
          Paginate(Var('match'), { size: Var('size'), before: Var('before') })
        )
      },
      Map(Var('page'), Lambda(['ref'], Get(Var('ref'))))
    )
  )
)

export default If(
  Exists(Function(name)),
  Update(Function(name), { name, body }),
  CreateFunction({ name, body })
)

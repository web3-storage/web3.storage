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
  Let
} = fauna

const name = 'findPinsByStatus'
const body = Query(
  Lambda(
    ['status', 'size', 'after', 'before'],
    Let(
      {
        match: Match(Index('pin_by_status_sort_by_created_desc'), Var('status')),
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
      Map(Var('page'), Lambda(['created', 'ref'], Get(Var('ref'))))
    )
  )
)

export default If(
  Exists(Function(name)),
  Update(Function(name), { name, body }),
  CreateFunction({ name, body })
)

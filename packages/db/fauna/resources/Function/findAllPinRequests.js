import fauna from 'faunadb'

const {
  Function,
  CreateFunction,
  Query,
  Lambda,
  Var,
  Exists,
  If,
  Update,
  Paginate,
  Map,
  Get,
  Equals,
  Let,
  Match,
  Index
} = fauna

// return all, oldest first, paginated
const name = 'findAllPinRequests'
const body = Query(
  Lambda(
    ['size', 'after', 'before'],
    Let(
      {
        match: Match(Index('pinrequest_sort_by_created_asc')),
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

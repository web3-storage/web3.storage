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
  Ref,
  Collection,
  Select,
  Filter,
  LT,
  Map,
  Get,
  Equals,
  Let
} = fauna

const name = 'findUploads'
const body = Query(
  Lambda(
    ['where', 'size', 'after', 'before'],
    Let(
      {
        match: Filter(
          Match(
            Index('upload_sort_by_created_desc'),
            Ref(Collection('User'), Select('user', Var('where'))),
            true
          ),
          Lambda(
            ['created', 'ref'],
            LT(Var('created'), Select('createdBefore', Var('where')))
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
      Map(Var('page'), Lambda(['created', 'ref'], Get(Var('ref'))))
    )
  )
)

export default If(
  Exists(Function(name)),
  Update(Function(name), { name, body }),
  CreateFunction({ name, body })
)

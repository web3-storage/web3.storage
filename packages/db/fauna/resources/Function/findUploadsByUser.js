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

const name = 'findUploadsByUser'
const body = Query(
  Lambda(
    ['where', 'sortBy', 'sortOrder', 'size', 'after', 'before'],
    Let(
      {
        sortBy: Var('sortBy'),
        sortOrder: Var('sortOrder'),
        match: Filter(
          Match(
            // Select Index per sortBy and sortOrder
            If(
              // Name Sort
              Equals(Var('sortBy'), 'Name'),
              If(
                Equals(Var('sortOrder'), 'Asc'),
                Index('upload_by_user_sort_by_name_asc'),
                Index('upload_by_user_sort_by_name_desc')
              ),
              // Default to Date Sort
              If(
                Equals(Var('sortOrder'), 'Asc'),
                Index('upload_by_user_sort_by_created_asc'),
                Index('upload_by_user_sort_by_created_desc')
              )
            ),
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

import fauna from 'faunadb'

const {
  Function,
  CreateFunction,
  Query,
  Lambda,
  Count,
  Exists,
  If,
  Update,
  Sum,
  Match,
  Index,
  Map,
  Get,
  Var,
  Select,
  Documents,
  Collection,
  Paginate
} = fauna

const name = 'findMetrics'
const body = Query(
  Lambda(
    [],
    {
      data: {
        usersTotal: Count(Documents(Collection("User"))),
        uploadsTotal: Count(Documents(Collection("Upload"))),
        contentTotal: Count(Documents(Collection("Content"))),
        contentTotalBytes: Sum(Match(Index("content_sizes"))),
        dealsActiveTotal: Count(Match(
          Index("deals_by_status"),
          'Active'
        )),
        dealsQueuedTotal: Count(Match(
          Index("deals_by_status"),
          'Queued'
        )),
        pinsTotal: Count(Documents(Collection("Pin"))),
        pinsTotalBytes: Sum(
          Select('data', Map(
            Paginate(
              Match(
                Index("pins_content_by_status"),
                'Pinned'
              )
            ),
            Lambda(
              "pin",
              Select(["data", "dagSize"], Get(Var("pin")))
            )
          ))
        ),
        pinsQueuedTotal: Count(Match(
          Index("pins_by_status"),
          'PinQueued'
        )),
        pinsPinningTotal: Count(Match(
          Index("pins_by_status"),
          'Pinning'
        )),
        pinsPinnedTotal: Count(Match(
          Index("pins_by_status"),
          'Pinned'
        )),
        pinsFailedTotal: Count(Match(
          Index("pins_by_status"),
          'PinError'
        )),
      }
    }
  )
)

export default If(
  Exists(Function(name)),
  Update(Function(name), { name, body }),
  CreateFunction({ name, body })
)

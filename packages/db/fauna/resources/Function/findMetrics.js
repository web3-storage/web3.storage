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
  Documents,
  Collection
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
          Index("deals"),
          'Active'
        )),
        dealsQueuedTotal: Count(Match(
          Index("deals"),
          'Queued'
        )),
        pinsTotal: Count(Documents(Collection("Pin"))),
        pinsTotalBytes: Sum(Match(
          Index("pins_sizes"),
          'Pinned'
        )),
        pinsQueuedTotal: Count(Match(
          Index("pins"),
          'PinQueued'
        )),
        pinsPinningTotal: Count(Match(
          Index("pins"),
          'Pinning'
        )),
        pinsPinnedTotal: Count(Match(
          Index("pins"),
          'Pinned'
        )),
        pinsFailedTotal: Count(Match(
          Index("pins"),
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

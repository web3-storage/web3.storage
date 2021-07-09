import { useState } from 'react'
import { useQuery, useQueryClient } from 'react-query'
import filesize from 'filesize'
import Button from '../components/button.js'
import Loading from '../components/loading'
import { getUploads, deleteUpload } from '../lib/api.js'
import { When } from 'react-if'

/**
 * Static Props
 *
 * @returns {{ props: import('../components/types.js').LayoutProps}}
 */
export function getStaticProps() {
  return {
    props: {
      title: 'Files - Web3 Storage',
      navBgColor: 'white',
      redirectTo: '/',
      needsUser: true,
    },
  }
}

/**
 * Files Page
 *
 * @param {import('../components/types.js').LayoutChildrenProps} props
 * @returns
 */
export default function Files({ user }) {
  const [deleting, setDeleting] = useState('')
  const [size] = useState(25)
  const [befores, setBefores] = useState([new Date().toISOString()])
  const queryClient = useQueryClient()
  const queryParams = { before: befores[0], size }
  /** @type {[string, { before: string, size: number }]} */
  const queryKey = ['get-uploads', queryParams]
  const { status, data } = useQuery(
    queryKey,
    (ctx) => getUploads(ctx.queryKey[1]),
    {
      enabled: !!user,
    }
  )
  /** @type {any[]} */
  const uploads = data || []

  /**
   * @param {import('react').ChangeEvent<HTMLFormElement>} e
   */
  async function handleDelete(e) {
    e.preventDefault()
    const data = new FormData(e.target)
    const cid = data.get('cid')
    if (cid && typeof cid === 'string') {
      if (!confirm('Are you sure? Deleted files cannot be recovered!')) {
        return
      }
      setDeleting(cid)
      try {
        // const client = new Web3Storage({
        //   token: await getToken(),
        //   endpoint: new URL(API),
        // })
        // await client.delete(cid)
        console.log('DELETE', data, data.get('id'))
      } finally {
        await queryClient.invalidateQueries('get-uploads')
        setDeleting('')
      }
    }
  }

  function handlePrevClick() {
    if (befores.length === 1) return
    setBefores(befores.slice(1))
  }

  function handleNextClick() {
    if (uploads.length === 0) return
    setBefores([uploads[uploads.length - 1].created, ...befores])
  }

  const hasZeroNfts = uploads.length === 0 && befores.length === 1

  return (
    <main className="bg-nsyellow">
      <div className="mw9 center pv3 ph3 ph5-ns min-vh-100">
        <When condition={status === 'loading'}>
          <Loading />
        </When>
        <When condition={status !== 'loading'}>
          <>
            <div className="flex mb3 items-center">
              <h1 className="chicagoflf mv4 flex-auto">Files</h1>
              <Button href="/new-file" className="flex-none" id="upload">
                + Upload
              </Button>
            </div>
            <div className="table-responsive">
              <When condition={hasZeroNfts}>
                <p className="tc mv5">
                  <span className="f1 dib mb3">😢</span>
                  <br />
                  No files
                </p>
              </When>
              <When condition={!hasZeroNfts}>
                <>
                  <table className="bg-white ba b--black w-100 collapse">
                    <thead>
                      <tr className="bb b--black">
                        <th className="pa2 tl bg-nsgray br b--black w-33">
                          Date
                        </th>
                        <th className="pa2 tl bg-nsgray br b--black w-33">
                          Name
                        </th>
                        <th className="pa2 tl bg-nsgray br b--black w-33">
                          Size
                        </th>
                        <th className="pa2 tc bg-nsgray" />
                      </tr>
                    </thead>
                    <tbody>
                      {uploads.map(
                        (/** @type {any} */ upload, /** @type {number} */ _) => (
                          <tr className="bb b--black" key={upload.content.cid}>
                            <td className="pa2 br b--black">
                              {upload.created.split('T')[0]}
                            </td>
                            <td className="pa2 br b--black">
                              <GatewayLink cid={upload.content.cid} name={upload.name} />
                            </td>
                            <td className="pa2 br b--black mw7">
                              {upload.content.dagSize ? filesize(upload.content.dagSize) : 'Calculating...'}
                            </td>
                            <td className="pa2">
                              <form onSubmit={handleDelete}>
                                <input
                                  type="hidden"
                                  name="cid"
                                  value={upload.content.cid}
                                />
                                <Button
                                  className="bg-red white"
                                  type="submit"
                                  disabled={Boolean(deleting)}
                                  id="delete-upload"
                                >
                                  {deleting === upload.content.cid
                                    ? 'Deleting...'
                                    : 'Delete'}
                                </Button>
                              </form>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                  <div className="tc mv3">
                    <Button
                      className="black"
                      wrapperClassName="mh2"
                      disabled={befores.length === 1}
                      onClick={handlePrevClick}
                      id="uploads-previous"
                    >
                      ← Previous
                    </Button>
                    <Button
                      className="black"
                      wrapperClassName="mh2"
                      disabled={uploads.length < size}
                      onClick={handleNextClick}
                      id="uploads-next"
                    >
                      Next →
                    </Button>
                  </div>
                </>
              </When>
            </div>
          </>
        </When>
      </div>
    </main>
  )
}

/**
 * Gateway Link Component
 *
 * @param {{cid: string, name?: string}} props
 */
function GatewayLink({ cid, name }) {
  const href = cid.startsWith('Qm')
    ? `https://ipfs.io/ipfs/${cid}`
    : `https://${cid}.ipfs.dweb.link`
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="black">
      {name || cid}
    </a>
  )
}

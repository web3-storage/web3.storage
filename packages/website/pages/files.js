import { useState } from 'react'
import { useQuery, useQueryClient } from 'react-query'
import filesize from 'filesize'
import Button from '../components/button.js'
import Checkbox from '../components/checkbox'
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
      pageBgColor: 'bg-w3storage-neutral-red',
      redirectTo: '/',
      needsUser: true,
    },
  }
}

/**
 * If it's a different day, it returns the day, otherwise it returns the hour
 * @param {*} timestamp
 * @returns {string}
 */
const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp)
  const today = new Date();
  if(date.getUTCDay() === today.getUTCDay() && date.getUTCMonth() === today.getUTCMonth() && date.getFullYear() === today.getFullYear()) {
    return timestamp.split('T')[1].split('.')[0]
  }
  return timestamp.split('T')[0]
}

/**
 * Files Page
 *
 * @param {import('../components/types.js').LayoutChildrenProps} props
 * @returns
 */
export default function Files({ user }) {
  const [size] = useState(25)
  const [befores, setBefores] = useState([new Date().toISOString()])
  const [selectedFiles, setSelectedFiles] = useState(Array())
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

  function handleDelete() {
    if (!confirm('Are you sure? Deleted files cannot be recovered!')) return

    selectedFiles.map(async cid => {
      if (!cid || typeof cid !== 'string') return;

      try {
        await deleteUpload(cid)
      } finally {
        await queryClient.invalidateQueries('get-uploads')
      }
    })

    setSelectedFiles([])
  }

  function handlePrevClick() {
    if (befores.length === 1) return
    setBefores(befores.slice(1))
  }

  function handleNextClick() {
    if (uploads.length === 0) return
    setBefores([uploads[uploads.length - 1].created, ...befores])
  }

  const hasZeroUploads = uploads.length === 0 && befores.length === 1

  const tableClass = 'px-2 border-2 border-w3storage-red bg-white'

  /**
   * @param {Object} props
   * @param {Object} [props.children]
   */
  const TableHeader = ({ children }) => (
    <th className="px-2 border-2 border-w3storage-red bg-w3storage-red-background">
      { children }
    </th>
  )

  /**
   * @param {Object} props
   * @param {Object} [props.children]
   */
  const TableElement = ({ children }) => (
    <td className="px-2 border-2 border-w3storage-red bg-white break-all">
      { children }
    </td>
  )

  /**
   * @param {string} cid
   */
  const toggle = (cid) => {
    const newSelectedFiles = selectedFiles.includes(cid) ? selectedFiles.filter(x => x !== cid) : [...selectedFiles, cid]
    setSelectedFiles(newSelectedFiles);
  }

  const toggleAll = () => {
    selectedFiles.length >= 1 ? setSelectedFiles([]) : setSelectedFiles(uploads.map(u => u.content.cid))
  }

  return (
    <main className="p-4 sm:px-16 mt-4 sm:mt-32 text-w3storage-purple">
      <div className="mw9 pv3 ph3 ph5-ns min-vh-100">
        <When condition={status === 'loading'}>
          <Loading />
        </When>
        <When condition={status !== 'loading'}>
          <>
            <div className="flex mb3 pb-10">
              <h1 className="text-2xl mv4 flex-auto">Files</h1>
            </div>
            <div className="table-responsive">
              <When condition={hasZeroUploads}>
                <p className="flex justify-center font-black mt-10">
                  No files
                </p>
                <div className="w-35 ml-auto">
                  <Button href="/new-file" id="upload">Upload File</Button>
                </div>
              </When>
              <When condition={!hasZeroUploads}>
                <>
                  <div className="flex ml-6">
                    <Button small disabled={selectedFiles.length === 0} onClick={handleDelete}>
                      Delete
                    </Button>
                    <Button small className="ml-2">
                      Export Deals
                    </Button>
                    <div className="w-35 ml-auto">
                      <Button href="/new-file" small id="upload">Upload File</Button>
                    </div>
                  </div>
                  <table className="w-full mt-4">
                    <thead>
                      <tr className="bb b--black">
                        <th>
                          <Checkbox className="mr-2" checked={selectedFiles.length === uploads.length} onChange={toggleAll}/>
                        </th>
                        <TableHeader>Timestamp</TableHeader>
                        <TableHeader>API key name</TableHeader>
                        <TableHeader>Name</TableHeader>
                        <TableHeader>CiD</TableHeader>
                        <TableHeader>Pin Status</TableHeader>
                        <TableHeader>Miner list</TableHeader>
                        <TableHeader>Renewal By</TableHeader>
                        <TableHeader>Size</TableHeader>
                      </tr>
                    </thead>
                    <tbody>
                      {uploads.map(
                        (/** @type {any} */ upload, /** @type {number} */ _) => (
                          <tr key={upload.content.cid}>
                            <td>
                              <Checkbox className="mr-2" checked={selectedFiles.includes(upload?.content?.cid)} onChange={() => toggle(upload.content.cid)}/>
                            </td>
                            <TableElement>{formatTimestamp(upload.created)}</TableElement>
                            <TableElement>{upload.name}</TableElement>
                            <TableElement>{upload.name}</TableElement>
                            <TableElement><GatewayLink cid={upload.content.cid} /></TableElement>

                            <TableElement>TBD</TableElement>
                            <TableElement>TBD</TableElement>
                            <TableElement>TBD</TableElement>

                            <TableElement>
                              {upload.content.dagSize ? filesize(upload.content.dagSize) : 'Calculating...'}
                            </TableElement>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                  <div className="mt-4 flex justify-between ml-6">
                    <When condition={befores.length !== 1}>
                      <Button
                        className="black"
                        wrapperClassName="m-h-2"
                        onClick={handlePrevClick}
                        id="uploads-previous"
                        >
                        ← Previous
                      </Button>
                    </When>
                    <When condition={uploads.length >= size}>
                      <Button
                        className="black"
                        wrapperClassName="m-h-2"
                        onClick={handleNextClick}
                        id="uploads-next"
                      >
                        Next →
                      </Button>
                    </When>
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
function GatewayLink({ cid }) {
  const href = cid.startsWith('Qm')
    ? `https://ipfs.io/ipfs/${cid}`
    : `https://${cid}.ipfs.dweb.link`
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="black underline">
      {cid.substr(0, 10)}...{cid.substr(cid.length - 6, cid.length)}
    </a>
  )
}

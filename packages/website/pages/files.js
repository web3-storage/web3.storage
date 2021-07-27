import { useState } from 'react'
import { useQuery, useQueryClient } from 'react-query'
import filesize from 'filesize'
import Button from '../components/button.js'
import Checkbox from '../components/checkbox'
import Loading from '../components/loading'
import { getUploads, deleteUpload } from '../lib/api.js'
import { When } from 'react-if'
import clsx from 'clsx'

/** @typedef {{ name?: string } & import('web3.storage').Status} Upload */

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
  return new Date(timestamp).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }) 
}

/**
 * @param {Object} props
 * @param {Object} [props.children]
 * @param {number} [props.index]
 * @param {boolean} [props.checked]
 * @param {boolean} [props.breakAll]
 * @param {boolean} [props.centered]
 * @param {boolean} [props.important]
*/
const TableElement = ({ children, index = 0, checked, breakAll = true, centered, important }) => (
  <td className={clsx('px-2 border-2 border-w3storage-red',
     index % 2 === 0 ? 'bg-white' : 'bg-gray-100',
     checked && 'bg-w3storage-red-accent bg-opacity-20',
     breakAll && 'break-all',
     centered && 'text-center'
    )} style={{ minWidth: important ?  150 : 0 }}>
    { children }
  </td>
)

/**
 * @param {Object} props
 * @param {Upload} props.upload
 * @param {number} props.index
 * @param {function} props.toggle
 * @param {string[]} props.selectedFiles
 */
const UploadItem = ({ upload, index, toggle, selectedFiles }) => {
  const checked = selectedFiles.includes(upload.cid)
  const sharedArgs = { index, checked }

  let pinStatus = '-'
  if (upload.pins.length) {
    pinStatus = upload.pins.some(p => p.status === 'Pinned')
      ? 'Pinned'
      : upload.pins[0].status
  }

  const deals = upload.deals
    .filter(d => d.status !== 'Queued')
    .map((deal, i, deals) => {
      const url = `https://filfox.info/en/deal/${deal.dealId}`
      return (
        <span key={deal.dealId} title={deal.status}>
          <a className="underline" href={url} target="_blank" rel="noreferrer">
            {deal.storageProvider}
          </a>
          {i === deals.length - 1 ? '' : ', '}
        </span>
      )
    })

  const queuedDeals = upload.deals.filter(d => d.status === 'Queued')
  if (queuedDeals.length) {
    deals.push(
      <span key={upload.cid + '-pending'} title={`Upload is queued in ${queuedDeals.length} aggregate${queuedDeals.length > 1 ? 's' : ''} for deals.`}>
        {`${deals.length ? ', ' : ''}${queuedDeals.length} pending`}
      </span>
    )
  }

  if (!upload.deals.length) {
    deals.push(
      <span key='enqueuing' title='Upload is being added to an aggregate and waiting to join the deal queue.'>
        Enqueuing
      </span>
    )
  }

  return (
    <tr>
      <td className="w-8">
        <Checkbox className="mr-2" checked={checked} onChange={() => toggle(upload.cid)}/>
      </td>
      <TableElement {...sharedArgs}>
        <span title={upload.created} className="break-normal">{formatTimestamp(upload.created)}</span>
      </TableElement>
      <TableElement {...sharedArgs} important>{upload.name}</TableElement>
      <TableElement {...sharedArgs} important>
        <GatewayLink cid={upload.cid} />
      </TableElement>
      <TableElement {...sharedArgs} centered>{pinStatus}</TableElement>
      <TableElement {...sharedArgs} breakAll={false}>{deals}</TableElement>
      <TableElement {...sharedArgs} centered>
        {upload.dagSize ? filesize(upload.dagSize) : '-'}
      </TableElement>
    </tr>
  )
}

/**
 * Files Page
 *
 * @param {import('../components/types.js').LayoutChildrenProps} props
 * @returns
 */
export default function Files({ user }) {
  /** @type string[] */
  const initialFiles = [];

  const [selectedFiles, setSelectedFiles] = useState(/** @type string[] */ initialFiles)
  const [size] = useState(25 + 1)
  const [befores, setBefores] = useState([new Date().toISOString()])
  const queryClient = useQueryClient()
  const queryParams = { before: befores[0], size }
  /** @type {[string, { before: string, size: number }]} */
  const queryKey = ['get-uploads', queryParams]
  const { isLoading, isFetching, data } = useQuery(
    queryKey,
    (ctx) => getUploads(ctx.queryKey[1]),
    {
      enabled: !!user,
    }
  )

  /** @type {Upload[]} */
  const uploads = data?.length === size ? data.concat().splice(0, size - 1) : (data || [])

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
   * @param {string} cid
   */
  const toggle = (cid) => {
    const newSelectedFiles = selectedFiles.includes(cid) ? selectedFiles.filter(x => x !== cid) : [...selectedFiles, cid]
    setSelectedFiles(newSelectedFiles)
  }

  const toggleAll = () => {
    selectedFiles.length >= 1 ? setSelectedFiles([]) : setSelectedFiles(uploads.map(u => u.cid))
  }

  const FilesTable = () => (
    <table className="w-full mt-4">
      <thead>
        <tr>
          { uploads.length > 0 && (
          <th className="w-8">
            <Checkbox className="mr-2" checked={selectedFiles.length === uploads.length} onChange={toggleAll} />
          </th> )}
          <TableHeader>Timestamp</TableHeader>
          <TableHeader>Name</TableHeader>
          <TableHeader>CID</TableHeader>
          <TableHeader>Pin Status</TableHeader>
          <TableHeader>Storage Providers</TableHeader>
          <TableHeader>Size</TableHeader>
        </tr>
      </thead>
      <tbody>
        {uploads.map((upload, index) =>
          <UploadItem key={upload.cid} upload={upload} index={index} toggle={toggle} selectedFiles={selectedFiles} />
        )}
      </tbody>
    </table>
  )

  return (
    <main className="layout-margins">
      <div className="mx-auto my-4 lg:my-32 text-w3storage-purple">
        <h3 className="mb-8">Files</h3>
        <When condition={isLoading || isFetching}>
          <Loading />
        </When>
        <When condition={!isLoading && !isFetching}>
          <>
            <div className="table-responsive">
              <When condition={hasZeroUploads}>
                <FilesTable />
                <p className="flex justify-center font-black mt-4 mb-10">
                  No files
                </p>
                <div className="w-36 m-auto">
                  <Button href="/upload" id="upload">Upload File</Button>
                </div>
              </When>
              <When condition={!hasZeroUploads}>
                <>
                  <div className="flex ml-7 md:ml-8">
                    <Button small disabled={selectedFiles.length === 0} onClick={handleDelete}>
                      Delete
                    </Button>
                    {/* <Button small className="ml-2">
                      Export Deals
                    </Button> */}
                    <div className="w-35 ml-auto">
                      <Button href="/upload" small id="upload">Upload File</Button>
                    </div>
                  </div>
                  <FilesTable />
                  <div className="mt-4 flex justify-between ml-7 md:ml-8">
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
                    <When condition={data?.length === size }>
                      <Button
                        className="black"
                        wrapperClassName="m-h-2 ml-auto"
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

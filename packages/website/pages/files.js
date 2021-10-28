import React, { useState } from 'react'
import { useQuery, useQueryClient } from 'react-query'
import filesize from 'filesize'
import { CopyToClipboard } from 'react-copy-to-clipboard'

import Button from '../components/button.js'
import Checkbox from '../components/checkbox'
import Loading from '../components/loading'
import Tooltip from '../components/tooltip'

import CopyIcon from '../icons/copy'
import ChevronIcon from '../icons/chevron'
import PencilIcon from '../icons/pencil'
import TickIcon from '../icons/tick'
import countly from '../lib/countly'
import { getUploads, deleteUpload, renameUpload } from '../lib/api.js'
import { When } from 'react-if'
import clsx from 'clsx'
import Script from 'next/script'

/** @typedef {{ name?: string } & import('web3.storage').Upload} Upload */

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
      redirectTo: '/login/',
      needsLoggedIn: true,
    },
  }
}

const QuestionMark = () => (
  <div className="relative flex items-center justify-center ml-3 text-sm text-w3storage-red cursor-pointer">
    <div className="absolute rounded-full border w-4 h-4 border-w3storage-red" />
    ?
  </div>
)

const TOOLTIPS = {
  PIN_STATUS: (<span>Reports the status of a file or piece of data stored on Web3.Storage’s IPFS nodes.</span>),

  CID: (<span>
    The <strong>c</strong>ontent <strong>id</strong>entifier for a file or a piece of data.<span> </span>
    <a href="https://docs.web3.storage/concepts/content-addressing/" target="_blank" className="underline" rel="noreferrer">Learn more</a>
  </span>),

  STORAGE_PROVIDERS: (<span>
    Service providers offering storage capacity to the Filecoin network.<span> </span>
    <a href="https://docs.web3.storage/concepts/decentralized-storage/" target="_blank" className="underline" rel="noreferrer">Learn more</a>
  </span>),

  QUEUED_UPLOAD: (<span>
    The content from this upload is being aggregated for storage on Filecoin. Filecoin deals will be active within 48 hours of upload.
  </span>)
}

/**
 * @param {string} pinStatus
 * @param {number} numberOfPins
 * @returns {any}
 */
const getMessage = (pinStatus, numberOfPins) => {
  switch (pinStatus) {
    case "Queuing":
      return "The upload has been received or is in progress and has not yet been queued for pinning.";
    case "PinQueued":
      return "The upload has been received and is in the queue to be pinned.";
    case "Pinning":
      return "The upload is being replicated to multiple IPFS nodes.";
    case "Pinned":
      return `The upload is fully pinned on ${numberOfPins} IPFS nodes.`;
  }
  return null;
};

/**
 * @param {string} pinStatus
 * @param {number} numberOfPins
 * @returns {JSX.Element}
 */
const getPinStatusTooltip = (pinStatus, numberOfPins) => {
  const message = getMessage(pinStatus, numberOfPins);

  if (!message) return <></>

  return (
    <Tooltip
      placement="top"
      overlay={<span>{message}</span>}
      overlayClassName="table-tooltip"
    >
      {QuestionMark()}
    </Tooltip>
  );
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
 * @param {boolean} [props.noWrap]
 * @param {boolean} [props.centered]
 * @param {boolean} [props.important]
*/
const TableElement = ({ children, index = 0, checked, noWrap = true, centered, important }) => (
  <td className={clsx('px-2 border-2 border-w3storage-red',
     index % 2 === 0 ? 'bg-white' : 'bg-gray-100',
     checked && 'bg-w3storage-red-accent bg-opacity-20',
     centered && 'text-center',
     noWrap && 'whitespace-nowrap'
    )} style={{ minWidth: important ?  150 : 0 }}>
    { children }
  </td>
)

/**
 * @param {import('web3.storage/src/lib/interface').Pin[]} pins
 * @returns {import('web3.storage/src/lib/interface').Pin['status'] | 'Queuing'}
 */
const getBestPinStatus = pins => {
  const pin = pins.find(byStatus('Pinned')) || pins.find(byStatus('Pinning')) || pins.find(byStatus('PinQueued'))
  return pin ? pin.status : 'Queuing'
}

/**
 * @param {import('web3.storage/src/lib/interface').Pin['status']} status
 * @returns {(pin: import('web3.storage/src/lib/interface').Pin) => boolean}
 */
const byStatus = status => pin => pin.status === status

/**
 * @param {Object} props
 * @param {Upload} props.upload
 * @param {number} props.index
 * @param {function} props.toggle
 * @param {string[]} props.selectedFiles
 * @param {function} props.showCopiedMessage
 */
const UploadItem = ({ upload, index, toggle, selectedFiles, showCopiedMessage }) => {
  const checked = selectedFiles.includes(upload.cid)
  const sharedArgs = { index, checked }
  const pinStatus = getBestPinStatus(upload.pins)
  const [isRenaming, setRenaming] = useState(false)
  const [isLoading, setLoading] = useState(false)
  const [renameError, setError] = useState('')
  const [renamedValue, setRenamedValue] = useState('')

  /** @param {import('react').ChangeEvent<HTMLFormElement>} ev */
  const handleRename = async (ev) => {
    ev.preventDefault()
    const data = new FormData(ev.target);
    const fileName = data.get("fileName")

    if(!fileName || typeof fileName !=='string') return;
    if (fileName === upload.name) return setRenaming(false)

    try {
      setLoading(true)
      await renameUpload(upload.cid, fileName)
      setError('')
    } catch(e) {
      console.error(e);
      // @ts-ignore Catch clause variable type annotation must be 'any' or 'unknown' if specified.ts(1196)
      setError(e.message)
    }
    setLoading(false)
    setRenaming(false)
    setRenamedValue(fileName)
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
    const message = `The content from this upload has been aggregated for storage on Filecoin and is queued for deals with ${queuedDeals.length} storage provider${queuedDeals.length > 1 ? 's' : ''}. Filecoin deals will be active within 48 hours of upload.`
    deals.push(
      <span className='flex justify-center' key={upload.cid + '-pending'}>
        {`${deals.length ? ', ' : ''}${queuedDeals.length} pending`}
        <Tooltip placement='top' overlay={<span>{message}</span>} overlayClassName='table-tooltip'>
          { QuestionMark() }
        </Tooltip>
      </span>
    )
  }

  if (!upload.deals.length) {
    deals.push(<span className='flex justify-center' key='queuing'>
        Queuing
        <Tooltip placement='top' overlay={TOOLTIPS.QUEUED_UPLOAD} overlayClassName='table-tooltip'>
        { QuestionMark() }
        </Tooltip>
      </span>
    )
  }

  return (
    <tr>
      <td className="w-8">
        <Checkbox className="mr-2" checked={checked} disabled={!upload.dagSize} disabledText='You may only delete after the upload is complete' onChange={() => toggle(upload.cid)}/>
      </td>
      <TableElement {...sharedArgs}>
        <span title={upload.created} className="break-normal">{formatTimestamp(upload.created)}</span>
      </TableElement>
      <TableElement {...sharedArgs} important noWrap={false}>
        {!isRenaming ? (
          <div className={ clsx("flex items-center justify-start", renameError.length > 0 && "text-w3storage-red")}>
            <span className="flex-auto">{renamedValue || upload.name}</span>
            { renameError.length > 0 &&
              <span className="rounded-full border-w3storage-red border flex-none w-6 h-6 flex justify-center items-center" title={renameError}>!</span>
            }
            <button className="p-2 pr-1 cursor-pointer" onClick={() => setRenaming(true)}>
              <PencilIcon style={{minWidth: 18 }} height="18" className="dib" fill="currentColor" aria-label="Edit"/>
            </button>
          </div>
        ) : (
          <form onSubmit={handleRename} className="flex items-center justify-start">
            <input className="flex-auto p-0" defaultValue={renamedValue || upload.name} autoFocus name="fileName" required/>
            <button className="p-2 pr-1 cursor-pointer" type="submit">
              { isLoading ?
                <Loading height={18} className="dib relative" fill="currentColor"/> :
                <TickIcon style={{minWidth: 18 }} height="18" className="dib" fill="currentColor" aria-label="Edit"/>
              }
            </button>
          </form>
        )}
      </TableElement>
      <TableElement {...sharedArgs} important>
        <div className="flex items-center justify-center">
          <GatewayLink cid={upload.cid} />
          <CopyToClipboard text={upload.cid} onCopy={() => showCopiedMessage()}>
            <CopyIcon className="ml-2 cursor-pointer hover:opacity-80" width="16" fill="currentColor"/>
          </CopyToClipboard>
        </div>
      </TableElement>
      <TableElement {...sharedArgs} centered>
        <span className="flex justify-center">
          {pinStatus}
          {getPinStatusTooltip(pinStatus, upload.pins.length)}
        </span>
      </TableElement>
      <TableElement {...sharedArgs} centered noWrap={false}>
        <div className="text-left">
          {deals}
        </div>
      </TableElement>
      <TableElement {...sharedArgs} centered>
        {upload.dagSize ? filesize(upload.dagSize) : 'Calculating...'}
      </TableElement>
    </tr>
  )
}

/**
 * Files Page
 *
 * @param {import('../components/types.js').LayoutChildrenProps} props
 */
export default function Files({ isLoggedIn }) {
  /** @type string[] */
  const initialFiles = [];

  const [selectedFiles, setSelectedFiles] = useState(initialFiles)
  const [size] = useState(25 + 1)
  const [copied, setCopied] = useState(false);
  const [sortingBy, setSortingBy] = useState('Date')
  const [sortOrder, setSortOrder] = useState('Desc')

  const [befores, setBefores] = useState([new Date().toISOString()])
  const queryClient = useQueryClient()
  const queryParams = { before: befores[0], size, sortBy: sortingBy, sortOrder }
  /** @type {[string, { before: string, size: number, sortBy: string, sortOrder: string }]} */
  const queryKey = ['get-uploads', queryParams]
  const { isLoading, isFetching, data, refetch } = useQuery(
    queryKey,
    (ctx) => getUploads(ctx.queryKey[1]),
    {
      enabled: isLoggedIn,
    }
  )

  const refreshUploads = async () => {
    if (befores.length <= 1) {
      setBefores([new Date().toISOString()])
    }
    return refetch();
  }

  /** @type {Upload[]} */
  const uploads = data?.length === size ? data.concat().splice(0, size - 1) : (data || [])

  function handleDelete() {
    if (!confirm('Are you sure? Deleted files cannot be recovered!')) {
      countly.trackEvent(countly.events.FILE_DELETE_CLICK, {
        ui: countly.ui.FILES,
        totalDeleted: 0
      })

      return
    }

    const deletedFiles = selectedFiles.map(async cid => {
      if (!cid || typeof cid !== 'string') return;

      try {
        await deleteUpload(cid)
      } finally {
        await queryClient.invalidateQueries('get-uploads')
      }

      return cid
    }).filter(cid => !!cid)

    countly.trackEvent(countly.events.FILE_DELETE_CLICK, {
      ui: countly.ui.FILES,
      totalDeleted: deletedFiles.length
    })

    setSelectedFiles([])
  }

  const handleFirstPageClick = () => setBefores([new Date().toISOString()])

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
   * @param {boolean} [props.sortable]
   * @param {string} [props.sortKey]
   */
  const TableHeader = ({ children, sortable, sortKey }) => (
    <th className="px-4 border-2 border-w3storage-red bg-w3storage-red-background whitespace-nowrap">
      <div className="flex items-center justify-center">
      { children } { sortable && sortKey ?
        <div className="relative ml-1 mr-2">
          <button className="absolute bottom-0 left-0 p-1 pb-0 cursor-pointer" onClick={() => { setSortOrder('Asc'); setSortingBy(sortKey)}}>
            <ChevronIcon width="13" height="10" className={clsx(sortKey === sortingBy && sortOrder === 'Asc'  && 'text-w3storage-red', 'transform rotate-180')}/>
          </button>
          <button className="absolute top-0 left-0 p-1 pt-0 cursor-pointer" onClick={() => { setSortOrder('Desc'); setSortingBy(sortKey)} }>
            <ChevronIcon width="13" height="10" className={clsx(sortKey === sortingBy && sortOrder === 'Desc' && 'text-w3storage-red')}/>
          </button>
        </div> : null
      }
      </div>
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
    selectedFiles.length >= 1
      ? setSelectedFiles([])
      : setSelectedFiles(uploads.filter(u => Boolean(u.dagSize)).map(u => u.cid))
  }

  const showCopiedMessage = () => {
    setCopied(true)
    setTimeout(() => setCopied(false), 4 * 1000)
  }

  const FilesTable = () => (
    <table className={ clsx("mt-4", uploads.length === 0 ? 'flex justify-center' : 'w-full')}>
      <thead>
        <tr>
          { uploads.length > 0 && (
          <th className="w-8">
            <Checkbox className="mr-2" checked={selectedFiles.length === uploads.filter(u => Boolean(u.dagSize)).length} disabled={uploads.every(upload => !upload.dagSize)} onChange={toggleAll} />
          </th> )}
          <TableHeader sortable sortKey="Date">Timestamp</TableHeader>
          <TableHeader sortable sortKey="Name">Name</TableHeader>
          <TableHeader>
            <span className="flex w-100 justify-center items-center">CID
              <Tooltip placement='top' overlay={TOOLTIPS.CID} overlayClassName='table-tooltip'>
                { QuestionMark() }
              </Tooltip>
            </span>
          </TableHeader>
          <TableHeader>
            <span className="flex w-100 justify-center">Pin Status
              <Tooltip placement='top' overlay={TOOLTIPS.PIN_STATUS} overlayClassName='table-tooltip'>
                {QuestionMark()}
              </Tooltip>
            </span>
          </TableHeader>
          <TableHeader>
            <span className="flex w-100 justify-center">Storage Providers
              <Tooltip placement='top' overlay={TOOLTIPS.STORAGE_PROVIDERS} overlayClassName='table-tooltip'>
                {QuestionMark()}
              </Tooltip>
            </span>
          </TableHeader>
          <TableHeader>Size</TableHeader>
        </tr>
      </thead>
      <tbody>
        {uploads.map((upload, index) =>
          <UploadItem key={upload.cid} upload={upload} index={index} toggle={toggle}
            selectedFiles={selectedFiles} showCopiedMessage={showCopiedMessage}
          />
        )}
      </tbody>
    </table>
  )

  return (
    <>
      <Script src="//embed.typeform.com/next/embed.js" />
      <main className="w-full">
        <div className="layout-margins flex justify-center mt-4 lg:mt-16">
          <Button data-tf-popup="Q3FOftXD" wrapperClassName="max-w-xl">
            {"Tell us how we are doing"}
          </Button>
        </div>
        <div className="layout-margins my-4 lg:my-16 text-w3storage-purple">
          <h3 className="mb-8">Files</h3>
          <When condition={isLoading || isFetching}>
            <Loading />
          </When>
          <When condition={!hasZeroUploads}>
            <div className="flex flex-row flex-wrap justify-between ml-7 md:ml-8">
              <Button small disabled={selectedFiles.length === 0} onClick={handleDelete} wrapperClassName="mb-4 mr-4">
                Delete
              </Button>
              {/* <Button small className="ml-2">
                Export Deals
              </Button> */}
              <div className="flex flex-wrap -mt-4">
                <Button
                  small
                  onClick={() => refreshUploads()}
                  wrapperClassName="mt-4 mr-4"
                  tracking={{
                    event: countly.events.FILES_REFRESH,
                    ui: countly.ui.FILES,
                    action: 'Refresh',
                  }}
                >Refresh</Button>
                <Button
                  href="/upload"
                  small
                  id="upload"
                  wrapperClassName="mt-4"
                  tracking={{
                    ui: countly.ui.FILES,
                    action: 'Upload File',
                    data: { isFirstFile: false }
                  }}
                >Upload More Files</Button>
              </div>
            </div>
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
                    <Button
                      href="/upload"
                      id="upload"
                      tracking={{
                        ui: countly.ui.FILES,
                        action: 'Upload File',
                        data: { isFirstFile: true }
                      }}
                    >Upload Files</Button>
                  </div>
                </When>
                <When condition={!hasZeroUploads}>
                  <FilesTable />
                </When>
              </div>
              <div className="mt-4 flex ml-7 md:ml-8">
                <When condition={befores.length !== 1}>
                  <Button
                    className="black"
                    wrapperClassName="mr-2"
                    onClick={handleFirstPageClick}
                    id="uploads-first"
                    tracking={{
                      event: countly.events.FILES_NAVIGATION_CLICK,
                      ui: countly.ui.FILES,
                      action: 'First'
                    }}
                  >
                    First
                  </Button>
                  <Button
                    className="black"
                    onClick={handlePrevClick}
                    id="uploads-previous"
                    tracking={{
                      event: countly.events.FILES_NAVIGATION_CLICK,
                      ui: countly.ui.FILES,
                      action: 'Previous'
                    }}
                  >
                    ← Previous
                  </Button>
                </When>
                <When condition={data?.length === size }>
                  <Button
                    className="black"
                    wrapperClassName="ml-auto"
                    onClick={handleNextClick}
                    id="uploads-next"
                    tracking={{
                      event: countly.events.FILES_NAVIGATION_CLICK,
                      ui: countly.ui.FILES,
                      action: 'Next'
                    }}
                  >
                    Next →
                  </Button>
                </When>
              </div>
            </>
          </When>
        </div>
        <div className={clsx(
          'fixed bottom-0 left-0 right-0 bg-w3storage-blue-dark text-w3storage-white p-4 text-center appear-bottom-then-go-away',
          !copied && 'hidden')
        }>
          Copied CID to clipboard!
        </div>
      </main>
    </>
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

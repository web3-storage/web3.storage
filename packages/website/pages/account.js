/* eslint-env browser */
import React, { useState, useEffect, useMemo, useCallback, useContext } from 'react'
import { useQuery } from 'react-query'
import Link from 'next/link'
import { getTokens, getStorage, getUploads } from '../lib/api'
import countly from '../lib/countly'
import Button from '../components/button'
import Loading from '../components/loading'
import VerticalLines from '../illustrations/vertical-lines'
import { When } from 'react-if'
import emailContent from '../content/file-a-request'
import fileSize from 'filesize'
import { AppContext } from '../components/state-provider'

const MAX_STORAGE = 1.1e+12 /* 1 TB */

/**
 * Static Props
 *
 * @returns {{ props: import('../components/types').LayoutProps}}
 */
 export function getStaticProps() {
    return {
      props: {
        title: 'Account - Web3 Storage',
        redirectTo: '/login/',
        needsLoggedIn: true,
      },
    }
}

/**
 * @typedef {Object} StorageData
 * @property {Number} usedStorage
 */

/**
 * @param {Object} props
 * @param {boolean | undefined} [props.isLoggedIn]
 */
const StorageInfo = ({ isLoggedIn }) => {
  const { data, isLoading, isFetching } = useQuery('get-storage', getStorage, {
    enabled: isLoggedIn,
  })

  /** @type {StorageData} */
  const storageData = data || {usedStorage: 0};

  const mailTo = useMemo(() => {
    const { mail, subject, body } = emailContent
    return `mailto:${mail}?subject=${subject}&body=${encodeURIComponent(body.join('\n'))}`
  }, [])

  const isLoaded = !isLoading && !isFetching
  const percentage = Math.ceil((storageData.usedStorage || 0) / MAX_STORAGE * 100)

  return <div>
    <When condition={ isLoaded }>
      <div className="text-2xl font-medium">
        Storage:<span className="font-normal ml-2">{ fileSize(storageData.usedStorage) } of { fileSize(MAX_STORAGE) } used</span>
      </div>
      <div className="h-9 border-2 border-w3storage-red mt-4 bg-white" style={{ maxWidth: '24rem'}}>
        <div className="h-full bg-w3storage-red max-w-full grow-width" style={{
          width: `${percentage}%`,
        }}/>
      </div>

      <p className="mt-4">
        {'Need more? '}
        <a href={mailTo} target="_blank" rel="noreferrer">
          <span className="font-bold">
            {'File a request >'}
          </span>
        </a>
      </p>
    </When>
  </div>
}

const CURRENT_DATE = new Date().toISOString()

/**
 * @param {import('../components/types').LayoutChildrenProps} props
 */
export default function Account({ isLoggedIn }) {
  const [copied, setCopied] = useState('')
  const { data: tokensData, isLoading: isLoadingTokens, isFetching: isFetchingTokens } = useQuery('get-tokens', getTokens, {
    enabled: isLoggedIn
  })

  const { state } = useContext(AppContext)  

  /** @type {import('./tokens').Token[]} */
  const tokens = tokensData || []

  const queryParams = { before: CURRENT_DATE, size: 1 }
  const queryKey = ['get-uploads', queryParams]
  const { data: uploadsData, isLoading: isLoadingUploads, isFetching: isFetchingUploads } = useQuery(
    queryKey,
    () => getUploads(queryParams),
    {
      enabled: isLoggedIn,
    }
  )

  const hasUploads = uploadsData ? uploadsData.length > 0 : 0

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(''), 5000)
    return () => clearTimeout(timer)
  }, [copied])

  const isLoaded = !isLoadingTokens && !isFetchingTokens && !isLoadingUploads && !isFetchingUploads && !!state.user

  const hasUsedTokensToUploadBefore = tokens.some(t => t.hasUploads)
  /**
   * @param {import('react').ChangeEvent<HTMLFormElement>} e
   */


  async function handleCopyToken(e) {
    e.preventDefault()
    const secret = e.target.dataset.value
    if (!secret) throw new Error('missing token value')
    await navigator.clipboard.writeText(secret)
    setCopied(secret)

    countly.trackEvent(countly.events.TOKEN_COPY, {
      ui: countly.ui.PROFILE_API_TOKENS,
    })
  }

  const onNewTokenClick = useCallback(() => {
    countly.trackEvent(countly.events.CTA_LINK_CLICK, {
      ui: countly.ui.PROFILE_API_TOKENS,
      action: 'Create an API Token'
    })
  }, [])

  return (
    <div className="relative overflow-hidden z-0">
      <When condition={isLoaded}>
        <div className="absolute top-10 right-0 pointer-events-none bottom-0 hidden md:flex justify-end z-n1">
          <VerticalLines className="h-full"/>
        </div>
      </When>
      <div className="layout-margins">
        <main className="max-w-screen-xl mx-auto my-4 lg:my-16 text-w3storage-purple">
          <div className="flex mb-8 flex-wrap items-center">
            <h3 className="mr-2">Your account</h3>
            <When condition={isLoaded}>
              { state.user?.info.email && <span>({state.user?.info.email}{state.user?.info.github && ` via GitHub` })</span> }
            </When>
          </div>
          <StorageInfo isLoggedIn={isLoggedIn} />
          <When condition={!isLoaded}>
              <div className="relative w-52 pt-60">
                <Loading />
              </div>
            </When>
          <When condition={isLoaded}>
            <When condition={tokens.length === 0 || !hasUsedTokensToUploadBefore}>
              <div className="mt-9">
                <When condition={!hasUploads}>
                  <h3 className="font-normal">Getting started</h3>
                  <div className="flex flex-wrap gap-x-10">
                    <div className="flex flex-col items-center mt-10 justify-between h-96 max-w-full bg-white border border-w3storage-red p-10 text-center" style={{ maxWidth: '24rem'}}>
                      <h3 className="font-normal">Upload your first file</h3>
                      <p>
                        Try uploading a file to Web3.Storage!
                      </p>
                      <Button
                        href='/files'
                        tracking={{ ui: countly.ui.PROFILE_GETTING_STARTED, action: 'Upload a file' }}
                      >
                        Upload a file
                      </Button>
                    </div>
                  </div>
                </When>
                <h3 className="font-normal mt-14">Next steps</h3>
                <div className="flex flex-wrap gap-x-10">
                  <When condition={tokens.length === 0}>
                    <div className="flex flex-col items-center mt-10 justify-between h-96 max-w-full bg-white border border-w3storage-red p-10 text-center" style={{ maxWidth: '24rem'}}>
                      <h3 className="font-normal">Create your first API token</h3>
                      <p>
                        Generate an API Token to embed into your projects!
                      </p>
                      <Button
                        href='/new-token'
                        tracking={{ ui: countly.ui.PROFILE_GETTING_STARTED, action: 'Create an API Token' }}
                      >
                        Create an API Token
                      </Button>
                    </div>
                  </When>
                  <When condition={tokens.length === 0 || !hasUsedTokensToUploadBefore}>
                    <div className="flex flex-col items-center mt-10 justify-between h-96 max-w-full bg-white border border-w3storage-red p-10 text-center" style={{ maxWidth: '24rem'}}>
                      <h3 className="font-normal">Read the docs</h3>
                      <p>
                        Start storing and retrieving files using our client library! See the docs for guides and walkthroughs!
                      </p>
                      <Button
                        href="https://docs.web3.storage"
                        tracking={{ ui: countly.ui.PROFILE_GETTING_STARTED, action: 'Explore the docs' }}
                      >
                        Explore the docs
                      </Button>
                    </div>
                  </When>
                </div>
              </div>
            </When>
            <When condition={tokens.length > 0}>
              <div className="mt-9">
                <h3 id="api-tokens" className="font-normal">API tokens</h3>
                <div className="flex flex-wrap gap-x-14 mt-10">
                  <Link href='/new-token'>
                    <button
                      type="button"
                      className="flex items-center justify-center text-center bg-w3storage-pink border-w3storage-red w-64 h-60 mb-12 p-9 hover:bg-w3storage-white"
                      onClick={onNewTokenClick}
                    >
                      <p className="typography-body-title px-8">Create an API token</p>
                    </button>
                  </Link>
                  {tokens.slice(0, 5).map(t => (
                    <form
                      key={t._id}
                      data-value={t.secret}
                      onSubmit={handleCopyToken}
                      className="flex flex-col justify-between items-center text-center bg-white border border-w3storage-red w-64 h-60 mb-12 px-8 py-9"
                    >
                      <p className="text-xl break-all">{t.name}</p>
                      <Button type="submit" wrapperClassName="w-full">{copied === t.secret ? 'Copied!' : 'Copy'}</Button>
                    </form>
                  ))}
                </div>
                <div className="w-64">
                  <Button
                    href="/tokens"
                    tracking={{ ui: countly.ui.PROFILE_API_TOKENS, action: 'Manage tokens' }}
                  >Manage tokens</Button>
                </div>
              </div>
            </When>
          </When>
        </main>
      </div>
    </div>
  )
}

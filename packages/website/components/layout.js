/* global VERSION, COMMITHASH */

import Head from 'next/head'
import clsx from 'clsx'
import Footer from './footer.js'
import Navbar from './navbar.js'
import Loading from './loading'
import { useLoggedIn } from '../lib/user'
import { getVersion } from '../lib/api'
import { getStatusPageSummary } from '../lib/statuspage-api'
import { useQuery } from 'react-query'

/**
 * @param {any} highlightMessage
 */
const MessageBanner = ({ highlightMessage }) => {
  let maintenanceMessage = ''

  const { data: statusPageData, error: statusPageError } = useQuery(
    'get-statuspage-summary',
    () => getStatusPageSummary()
  )
  const scheduledMaintenances =
    statusPageData?.scheduled_maintenances.filter(
      (/** @type {{ status: string; }} */ maintenance) =>
        maintenance.status !== 'completed'
    ) || []

  const { data: apiVersionData, error: apiVersionError } = useQuery(
    'get-version',
    () => getVersion(),
    {
      enabled:
        (statusPageData && scheduledMaintenances.length === 0) ||
        statusPageError !== null,
    }
  )

  if (scheduledMaintenances.length > 0) {
    maintenanceMessage =
      statusPageData.scheduled_maintenances[0].incident_updates[0].body
  }

  if (apiVersionData && apiVersionData.mode !== 'rw' && !maintenanceMessage) {
    maintenanceMessage =
      'The web3.Storage API is currently undergoing maintenance...'
  }

  if (statusPageError) {
    console.error(statusPageError)
  }

  if (apiVersionError) {
    console.error(apiVersionError)
  }

  if (maintenanceMessage) {
    return (
      <div className="w-full bg-w3storage-yellow text-center" style={{ zIndex: 50 }}>
        <div className="layout-margins py-2">
          <span className="text-xl">⚠</span> <span className="typography-cta">{maintenanceMessage}</span>
        </div>
      </div>
    )
  }

  if (highlightMessage) {
    return <div className="w-full bg-w3storage-purple text-white typography-cta text-center py-1" dangerouslySetInnerHTML={{ __html: highlightMessage }} />
  }

  return null
}

/**
 * @typedef {import('react').ReactChildren} Children
 * @typedef {(props: import('./types.js').LayoutChildrenProps) => Children} ChildrenFn
 */
/**
 *
 * @param {import('./types.js').LayoutProps & {children: ChildrenFn}} props
 * @returns
 */
export default function Layout({
  callback,
  needsLoggedIn = false,
  children,
  redirectTo,
  redirectIfFound = false,
  title = 'Web3 Storage - The simple file storage service for IPFS & Filecoin.',
  description = 'With Web3.Storage you get all the benefits of decentralized storage and content addressing with the frictionless experience you expect in a modern storage solution. It’s fast, open and it’s free.',
  pageBgColor = 'bg-w3storage-background',
  navBgColor = 'bg-w3storage-background',
  footerBgColor,
  data = null,
  highlightMessage,
}) {
  const { isLoggedIn, isLoading, isFetching } = useLoggedIn({
    redirectTo,
    redirectIfFound,
    enabled: needsLoggedIn,
  })
  const shouldWaitForLoggedIn = needsLoggedIn && !isLoggedIn
  // @ts-ignore VERSION is global var
  const globalVersion = VERSION
  // @ts-ignore COMMITHASH is global var
  const globalCommitHash = COMMITHASH
  return (
    <div className={clsx(pageBgColor, 'flex flex-col min-h-screen')}>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="website-version" content={globalVersion} />
        <meta name="website-commit" content={globalCommitHash} />
        <meta property="image" content="https://web3.storage/social-card.png" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://web3.storage" />
        <meta property="og:image" content="https://web3.storage/social-card.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://web3.storage/social-card.png" />
        <meta name="twitter:site" content="@protocollabs" />
        <meta name="twitter:creator" content="@protocollabs" />
      </Head>
      {shouldWaitForLoggedIn ? (
        <>
          <Navbar isLoggedIn={isLoggedIn} isLoadingUser={isLoading || isFetching} bgColor={navBgColor} />
            <Loading />
          <Footer bgColor={footerBgColor} />
        </>
      ) : callback ? (
        <>
          <Loading />
          {children({ isLoggedIn, data })}
        </>
      ) : (
        <>
          <MessageBanner highlightMessage={ highlightMessage }/>
          <Navbar isLoggedIn={isLoggedIn} isLoadingUser={isLoading || isFetching} bgColor={navBgColor} />
          {children({ isLoggedIn, data })}
          <Footer bgColor={footerBgColor} />
        </>
      )}
    </div>
  )
}

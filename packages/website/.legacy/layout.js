import Head from 'next/head'
import clsx from 'clsx'
import Footer from './footer/footer.js'
import Navbar from './navbar/navbar.js'
import Loading from './loading/loading'
import { useLoggedIn } from 'Lib/user'
import { getVersion } from 'Lib/api'
import { getStatusPageSummary } from 'Lib/statuspage-api'
import { useQuery } from 'react-query'

// ============================================================== Message Banner
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
      'The Web3.Storage API is currently undergoing maintenance...'
  }

  if (statusPageError) {
    console.error(statusPageError)
  }

  if (apiVersionError) {
    console.error(apiVersionError)
  }

  if (maintenanceMessage) {
    return (
      <div style={{ zIndex: 50, width: '100vw' }}>
        <div>
          <span>⚠</span> <span className="typography-cta">{maintenanceMessage}</span>
        </div>
      </div>
    )
  }

  if (highlightMessage) {
    return <div id="site-message-banner" dangerouslySetInnerHTML={{ __html: highlightMessage }} />
  }

  return null
}

// ====================================================================== Layout
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

  return (
    <div className="master-container">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
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
          <Navbar isLoggedIn={isLoggedIn} isLoadingUser={isLoading || isFetching} />
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
          <Navbar isLoggedIn={isLoggedIn} isLoadingUser={isLoading || isFetching} />
          {children({ isLoggedIn, data })}
          <Footer bgColor={footerBgColor} />
        </>
      )}

    </div>
  )
}

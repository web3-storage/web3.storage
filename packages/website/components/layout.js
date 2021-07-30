import Head from 'next/head'
import clsx from 'clsx'
import Footer from './footer.js'
import Navbar from './navbar.js'
import Loading from './loading'
import { useLoggedIn } from '../lib/user'

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
  description = 'Web3 Storage',
  pageBgColor = 'bg-w3storage-background',
  navBgColor = 'bg-w3storage-background',
  footerBgColor,
  hasBanner = false,
  data = null,
  highlightMessage,
}) {
  const { isLoggedIn, isLoading, isFetching } = useLoggedIn({
    redirectTo,
    redirectIfFound,
    enabled: needsLoggedIn,
  })
  const shouldWaitForLoggedIn = needsLoggedIn && isLoading

  return (
    <div className={clsx(pageBgColor, 'flex flex-col min-h-screen')}>
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
        <Loading />
      ) : callback ? (
        <>
          <Loading />
          {children({ isLoggedIn, data })}
        </>
      ) : (
        <>
          { highlightMessage &&
            <div className="w-full bg-w3storage-purple text-white typography-cta text-center py-1" dangerouslySetInnerHTML={{ __html: highlightMessage }} />
          }
          <Navbar isLoggedIn={isLoggedIn} isLoadingUser={isLoading || isFetching} bgColor={navBgColor} hasBanner={hasBanner} />
          {children({ isLoggedIn, data })}
          <Footer bgColor={footerBgColor} />
        </>
      )}
    </div>
  )
}

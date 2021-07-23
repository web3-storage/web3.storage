import Head from 'next/head'
import clsx from 'clsx'
import Footer from './footer.js'
import Navbar from './navbar.js'
import Loading from './loading'
import { useUser } from '../lib/user'

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
  needsUser = false,
  children,
  redirectTo,
  redirectIfFound = false,
  title = 'Web3 Storage - The simple file storage service for IPFS & Filecoin.',
  description = 'Web3 Storage',
  pageBgColor = 'bg-w3storage-background',
  navBgColor,
  footerBgColor,
  data = null,
  highlightMessage,
}) {
  const { user, status } = useUser({
    redirectTo,
    redirectIfFound,
    enabled: needsUser,
  })
  const shouldWaitForUser = needsUser && status === 'loading'

  return (
    <div className={clsx(pageBgColor, 'flex flex-col min-h-screen')}>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://web3.storage" />
        <meta
          property="og:image"
          content="https://web3.storage/images/social.png"
        />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@protocollabs" />
        <meta name="twitter:creator" content="@protocollabs" />
      </Head>
      {shouldWaitForUser ? (
        <Loading />
      ) : callback ? (
        <>
          <Loading />
          {children({ user, data })}
        </>
      ) : (
        <>
          { highlightMessage &&
            <div className="w-full bg-w3storage-purple text-white typography-cta text-center py-1" dangerouslySetInnerHTML={{ __html: highlightMessage }} />
          }
          <Navbar user={user} bgColor={navBgColor} />
          {children({ user, data })}
          <Footer bgColor={footerBgColor} />
        </>
      )}
    </div>
  )
}

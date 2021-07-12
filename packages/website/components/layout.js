import Head from 'next/head'
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
  navBgColor = 'white',
}) {
  const { user, status } = useUser({
    redirectTo,
    redirectIfFound,
    enabled: needsUser,
  })
  const shouldWaitForUser = needsUser && status === 'loading'

  return (
    <div>
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
          {children({ user })}
        </>
      ) : (
        <>
          <Navbar bgColor={navBgColor} user={user} />
          {children({ user })}
          <Footer />
        </>
      )}
    </div>
  )
}

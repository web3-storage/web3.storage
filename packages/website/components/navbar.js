import { useCallback, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { getMagic } from '../lib/magic.js'
import countly from '../lib/countly'
import { useQueryClient } from 'react-query'
import Button from './button.js'
import clsx from 'clsx'
import Hamburger from '../icons/hamburger'

import Logo from '../icons/w3storage-logo'
import Cross from '../icons/cross'
import Loading from './loading.js'

/**
 * Navbar Component
 *
 * @param {Object} props
 * @param {string} [props.bgColor]
 * @param {boolean} [props.isLoggedIn]
 * @param {boolean} props.isLoadingUser
 */
export default function Navbar({ bgColor = '', isLoggedIn, isLoadingUser }) {
  const containerRef = useRef(null)
  const [isMenuOpen, setMenuOpen] = useState(false)
  const router = useRouter()

  const ITEMS = useMemo(
    () => [
      {
        link: 'https://docs.web3.storage/',
        slug: 'docs',
        name: 'Docs',
        spacing: 'p-3 md:px-6',
      },
      {
        link: '/about',
        slug: 'about',
        name: 'About',
        spacing: 'p-3 md:px-6',
      },
      {
        link: isLoggedIn ? '/files' : '/login',
        slug: 'files',
        name: 'Files',
        spacing: `p-3 md:px-6`,
      },
      {
        link: isLoggedIn ? '/account' : '/login',
        slug: 'account',
        name: 'Account',
        spacing: `p-3 md:px-6`,
      },
    ],
    [isLoggedIn],
  )

  const queryClient = useQueryClient()
  const onLinkClick = useCallback((event) => {
    countly.trackCustomLinkClick(
      countly.events.LINK_CLICK_NAVBAR,
      event.currentTarget,
    )
  }, [])

  async function logout() {
    await getMagic().user.logout()
    await queryClient.invalidateQueries('magic-user')
    router.push('/')
  }

  const toggleMenu = () => {
    isMenuOpen
      ? document.body.classList.remove('overflow-hidden')
      : document.body.classList.add('overflow-hidden')
    setMenuOpen(!isMenuOpen)
  }

  const logoutButton = (
    <Button
      onClick={logout}
      id="logout"
      wrapperClassName="inline-block ml-3 md:ml-6"
      variant="outlined"
      tracking={{
        event: countly.events.LOGOUT_CLICK,
        ui: countly.ui.NAVBAR,
        action: 'Logout',
      }}
    >
      Logout
    </Button>
  )

  const loginButton = (
    <Button
      href="/login"
      id="login"
      variant="dark"
      wrapperClassName="inline-block ml-3 md:ml-6 md:min-height[3.25rem]"
      tracking={{ ui: countly.ui.NAVBAR, action: 'Login' }}
    >
      Login
    </Button>
  )

  const spinnerButton = (
    <Button
      href="#"
      id="loading-user"
      wrapperClassName="inline-block ml-3 md:ml-6"
    >
      <Loading className="user-spinner" fill="white" height={10} />
    </Button>
  )

  return (
    <nav className={clsx(bgColor, 'w-full z-40')} ref={containerRef}>
      <div
        className={clsx(
          'py-3 text-w3storage-purple items-center w-100 grid grid-cols-3 md:flex md:justify-between layout-margins',
        )}
      >
        <div className="flex flex-1 align-middle md:hidden">
          <button onClick={toggleMenu}>
            <Hamburger className="w-6 m-2" aria-label="Toggle Navbar" />
          </button>
        </div>
        <div>
          <Link href="/">
            <a
              title="Web3 Storage"
              className={clsx('flex items-center justify-center')}
              onClick={onLinkClick}
            >
              <Logo
                style={{ width: '1.9rem' }}
                className="fill-current text-w3storage-purple w-full"
              />
              <span className="space-grotesk ml-2 text-w3storage-purple font-medium text-md hidden xl:inline-block">
                Web3.Storage
              </span>
            </a>
          </Link>
        </div>
        <div
          className="flex flex-1 items-center justify-end"
          style={{ minHeight: 52 }}
        >
          {ITEMS.map((item) => (
            <Link href={item.link} key={item.name}>
              <a
                onClick={onLinkClick}
                className={clsx(
                  'text-sm text-w3storage-purple font-bold hover:underline align-middle hidden md:flex',
                  item.spacing,
                  router.pathname.includes(item.slug) && 'underline',
                )}
              >
                {item.name}
              </a>
            </Link>
          ))}
          {isLoadingUser
            ? spinnerButton
            : isLoggedIn
            ? logoutButton
            : loginButton}
        </div>
      </div>
      {isMenuOpen && (
        <div
          className={clsx(
            'md:hidden transition-all duration-300 fixed top-0 left-0 bottom-0 shadow-2xl p-6 w-full bg-w3storage-blue-dark',
          )}
        >
          <div className="flex flex-col align-middle text-center mt-4">
            <a
              href="/"
              title="Web3 Storage"
              className="flex justify-center mb-8"
            >
              <Logo
                style={{ height: '4rem', minWidth: '4rem' }}
                className="fill-current text-w3storage-red"
              />
            </a>

            {ITEMS.map((item) => (
              <Link href={item.link} key={item.name}>
                <a
                  className={clsx(
                    'space-grotesk text-5xl text-white font-bold no-underline hover:underline align-middle mt-4',
                    item.spacing,
                  )}
                  onClick={() => toggleMenu()}
                >
                  {item.name}
                </a>
              </Link>
            ))}
            <button
              className="flex justify-center mt-16"
              onClick={() => toggleMenu()}
              aria-labelledby="close-menu-text"
            >
              <span id="close-menu-text" hidden>
                Close Menu
              </span>
              <Cross
                width="48"
                height="48"
                aria-hidden="true"
                focusable="false"
              />
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}

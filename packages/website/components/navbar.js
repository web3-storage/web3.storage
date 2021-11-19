import { useCallback, useMemo, useRef, useState } from 'react'
import Router from 'next/router'
import Link from 'next/link'
import { getMagic } from '../lib/magic.js'
import countly from '../lib/countly'
import { useQueryClient } from 'react-query'
import Button from './button.js'
import { useResizeObserver } from '../hooks/resize-observer'
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
  const [isSmallVariant, setSmallVariant] = useState(false)
  const [isMenuOpen, setMenuOpen] = useState(false)

  useResizeObserver(containerRef, () => {
    const shouldGoToSmallVariant =  window.innerWidth < 640

    if (shouldGoToSmallVariant && !isSmallVariant) {
      setSmallVariant(true)
    }

    if (!shouldGoToSmallVariant && isSmallVariant) {
      setSmallVariant(false)
    }
  })

  const ITEMS = useMemo(() =>
    [
      {
        link: 'https://docs.web3.storage/',
        name: 'Docs',
        spacing: 'p-3 md:px-6'
      },
      {
        link: '/about',
        name: 'About',
        spacing: 'p-3 md:px-6'
      },
      {
        link: '/files',
        name: 'Files',
        spacing: `p-3 md:px-6`
      },
      {
        link: '/account',
        name: 'Account',
        spacing: `p-3 md:px-6`
      }
    ], [])

  const queryClient = useQueryClient()
  const onLinkClick = useCallback((event) => {
    countly.trackCustomLinkClick(
      countly.events.LINK_CLICK_NAVBAR,
      event.currentTarget
    )
  }, [])

  async function logout() {
    await getMagic().user.logout()
    await queryClient.invalidateQueries('magic-user')
    Router.push('/')
  }

  const toggleMenu = () => {
    isMenuOpen ? document.body.classList.remove('overflow-hidden') : document.body.classList.add('overflow-hidden')
    setMenuOpen(!isMenuOpen)
  }

  const logoutButton = (
    <Button
      onClick={logout}
      id="logout"
      wrapperClassName="inline-block ml-3 md:ml-6"
      variant="outlined"
      small={isSmallVariant}
      tracking={{
        event: countly.events.LOGOUT_CLICK,
        ui: countly.ui.NAVBAR,
        action: 'Logout'
      }}>
      Logout
    </Button>
  )

  const loginButton = (
    <Button href="/login" id="login" wrapperClassName="inline-block ml-3 md:ml-6" small={isSmallVariant} tracking={{ ui: countly.ui.NAVBAR, action: 'Login' }}>
      Login
    </Button>
    )

  const spinnerButton = (
    <Button href="#" id="loading-user" wrapperClassName="inline-block ml-3 md:ml-6" small={isSmallVariant} >
      <Loading className='user-spinner' fill='white' height={10} />
    </Button>
  )

  return (
    <nav className={clsx(bgColor, 'w-full z-50', isSmallVariant ? 'sticky top-0' : '')} ref={containerRef}>
      <div className={clsx("py-3 text-w3storage-purple items-center w-100", isSmallVariant ? 'grid grid-cols-3 px-4' : 'flex justify-between layout-margins')}>
        { isSmallVariant &&
          <div className="flex align-middle">
            <button onClick={toggleMenu}>
              <Hamburger className="w-6 m-2" aria-label="Toggle Navbar"/>
            </button>
          </div>
        }
        <div>
          <a href="/" title="Web3 Storage" className={clsx("flex items-center", isSmallVariant ? 'justify-center' : '')} onClick={onLinkClick}>
            <Logo style={{ width: '1.9rem' }} className="fill-current text-w3storage-purple w-full" />
            <span className="space-grotesk ml-2 text-w3storage-purple font-medium text-md hidden xl:inline-block">Web3.Storage</span>
          </a>
        </div>
        <div className={clsx("flex items-center", isSmallVariant ? 'justify-end' : '')} style={{ minHeight: 52 }}>
          { !isSmallVariant && ITEMS.map(item => (
            <a href={item.link} key={item.name} onClick={onLinkClick} className={clsx('text-sm text-w3storage-purple font-bold no-underline hover:underline align-middle', item.spacing)}>
              { item.name }
            </a>
          ))}
          {isLoadingUser
            ? spinnerButton
            : isLoggedIn
              ? logoutButton
              : loginButton
          }
        </div>
      </div>
      <div className={clsx(
          "transition-all duration-300 fixed top-0 left-0 bottom-0 shadow-2xl p-6 w-full bg-w3storage-blue-dark",
          isSmallVariant && isMenuOpen ? 'flex justify-center opacity-100' : 'opacity-0 invisible'
      )} aria-hidden={isSmallVariant && isMenuOpen}>
        <div className="flex flex-col align-middle text-center mt-4">
          <a href="/" title="Web3 Storage" className="flex justify-center mb-8">
            <Logo style={{ height: '4rem', minWidth: '4rem' }} className="fill-current text-w3storage-red" />
          </a>
          { ITEMS.map(item => (
            <Link href={item.link} key={item.name}>
              <a className={clsx('space-grotesk text-5xl text-white font-bold no-underline hover:underline align-middle mt-4', item.spacing)} onClick={() => toggleMenu()}>
                { item.name }
              </a>
            </Link>
          ))}
          <button className="flex justify-center mt-16" onClick={ () => toggleMenu() }>
            <Cross />
          </button>
        </div>
      </div>
    </nav>
  )
}

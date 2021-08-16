import { useCallback, useMemo, useRef, useState , useEffect } from 'react'
import Router from 'next/router'
import Link from 'next/link'
import { getMagic } from '../lib/magic.js'
import countly from '../lib/countly'
import { useQueryClient } from 'react-query'
import Button from './button.js'
import { useResizeObserver } from '../hooks/resize-observer'
import clsx from 'clsx'
import Hamburger from '../icons/hamburger'
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';

// Change this value if you change the navbar items.
const SMALL_VARIANT_MAX_SIZE = 400;

/**
 * Navbar Component
 *
 * @param {Object} props
 * @param {string} [props.bgColor]
 * @param {boolean} [props.isLoggedIn]
 * @param {boolean} props.isLoadingUser
 * @param {boolean} props.hasBanner
 */
export default function Navbar({ bgColor = '', isLoggedIn, isLoadingUser, hasBanner }) {
  const containerRef = useRef(null)
  const [isSmallVariant, setSmallVariant] = useState(false)
  const [isMenuOpen, setMenuOpen] = useState(false)
  const [shouldOffsetMenu, setOffsetMenu] = useState(false)

  // TODO: if we add translations or dynamic items, we should change the resize observer algorithm to reflect that
  // For now we're keeping it simple
  useResizeObserver(containerRef, ([resizeEntry]) => {
    const shouldGoToSmallVariant = resizeEntry.contentBoxSize[0].inlineSize <= SMALL_VARIANT_MAX_SIZE

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
        spacing: `p-3 py-3 md:px-6 ${isLoggedIn ? '' : 'mr-6 md:mr-0'}`
      }, {
        link: '/about',
        name: 'About',
        spacing: `p-3 py-3 md:px-6 ${isLoggedIn ? '' : 'mr-6 md:mr-0'}`
    }, ...(isLoggedIn ? [{
        link: '/files',
        name: 'Files',
        spacing: `p-3 md:px-6`
      },
      {
        link: '/account',
        name: 'Account',
        spacing: `p-3 md:px-6 mr-3 md:mr-6`
      }
    ] : [])
  ], [isLoggedIn])

  useEffect(() => {
    setOffsetMenu(hasBanner && window.scrollY < 50)
  }, [hasBanner, isMenuOpen])

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
    isMenuOpen ? enableBodyScroll(document.body) : disableBodyScroll(document.body)
    setMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    enableBodyScroll(document.body)
    setMenuOpen(false)
  }

  return (
    <nav className={clsx(bgColor, 'w-full z-50', isSmallVariant ? 'sticky top-0' : '')} ref={containerRef}>
      <div className={clsx("py-3 text-w3storage-purple items-center w-100", isSmallVariant ? 'grid grid-cols-3 px-4' : 'flex justify-between layout-margins')}>
        { isSmallVariant && <div onClick={toggleMenu}><Hamburger className="w-6 ml-4 cursor-pointer" aria-label="Toggle Navbar"/></div> }
        <a href="/" title="Web3 Storage" className={clsx("flex items-center", isSmallVariant ? 'justify-center' : '')} onClick={onLinkClick}>
          <img src="/w3storage-logo.svg" style={{ height: '1.8rem', minWidth: '1.8rem' }} />
          <span className="space-grotesk ml-2 text-w3storage-purple font-medium text-md hidden xl:inline-block">Web3.Storage</span>
        </a>
        <div className={clsx("flex items-center", isSmallVariant ? 'justify-end' : '')} style={{ minHeight: 52 }}>
          { !isSmallVariant && ITEMS.map(item => (
            <a href={item.link} key={item.name} onClick={onLinkClick} className={clsx('text-sm text-w3storage-purple font-bold no-underline hover:underline align-middle', item.spacing)}>
              { item.name }
            </a>
          ))}
          {isLoadingUser
            ? null
            : isLoggedIn
              ? (
                <Button
                  onClick={logout}
                  id="logout"
                  wrapperClassName="inline-block"
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
              : (
                <Button href="/login" id="login" wrapperClassName="inline-block" small={isSmallVariant} tracking={{ ui: countly.ui.NAVBAR, action: 'Login' }}>
                  Login
                </Button>
                )
          }
        </div>
      </div>

      { isSmallVariant && isMenuOpen && (<div className="fixed top-0 left-0 right-0 bottom-0 o-0" onClick={() => closeMenu()}/>)}
      <div className={clsx(
          "appear-from-left fixed left-0 bottom-0 shadow-2xl p-6 w-4/5", bgColor,
          isSmallVariant && isMenuOpen ? 'flex flex-col' : 'hidden',
          shouldOffsetMenu ? 'top-32': 'top-16',
      )} aria-hidden={isSmallVariant && isMenuOpen}>
        { ITEMS.map(item => (
          <Link href={item.link} key={item.name}>
            <a className={clsx('space-grotesk text-2xl text-w3storage-purple font-bold no-underline hover:underline align-middle', item.spacing)} onClick={() => closeMenu()}>
              { item.name }
            </a>
          </Link>
        ))}
      </div>
    </nav>
  )
}

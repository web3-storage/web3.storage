// ===================================================================== Imports
import { useCallback, useRef, useState } from 'react'
import { getMagic } from '../../lib/magic.js'
import countly from '../../lib/countly'
import { useQueryClient } from 'react-query'
import { useResizeObserver } from '../../hooks/resize-observer'
import clsx from 'clsx'

import Router from 'next/router'
import Link from 'next/link'

import Button from '../button/button.js'
import { ReactComponent as SiteLogo } from 'Icons/w3storage-logo.svg'
import { ReactComponent as Hamburger } from 'Icons/hamburger.svg'
import { ReactComponent as Cross } from 'Icons/cross.svg'
import Loading, { SpinnerSize } from '../loading/loading'

import GeneralPageData from '../../content/pages/general'
import styles from './navbar.module.css'

// ====================================================================== Params
/**
 * Navbar Component
 *
 * @param {Object} props
 * @param {boolean} [props.isLoggedIn]
 * @param {boolean} props.isLoadingUser
 */

// ===================================================================== Exports
export default function Navbar({ isLoggedIn, isLoadingUser }) {
  const containerRef = useRef(null)
  // component State
  const [isSmallVariant, setSmallVariant] = useState(false)
  const [isMenuOpen, setMenuOpen] = useState(false)
  // Navigation Content
  const navItems = GeneralPageData.navigation
  const logoText = GeneralPageData.site_logo.text

  // ================================================================= Functions
  useResizeObserver(containerRef, () => {
    const shouldGoToSmallVariant =  window.innerWidth < 640
    if (shouldGoToSmallVariant && !isSmallVariant) {
      setSmallVariant(true)
    }
    if (!shouldGoToSmallVariant && isSmallVariant) {
      setSmallVariant(false)
    }
  })

  const toggleMenu = () => {
    // isMenuOpen ? document.body.classList.remove('overflow-hidden') : document.body.classList.add('overflow-hidden')
    setMenuOpen(!isMenuOpen)
  }

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

  // ======================================================= Templates [Buttons]
  const logoutButton = (
    <Button
      onClick={logout}
      id="logout"
      variant="outlined"
      small={isSmallVariant}
      tracking={{
        event: countly.events.LOGOUT_CLICK,
        ui: countly.ui.NAVBAR,
        action: 'Logout'
      }}>
      Sign Out
    </Button>
  )

  const loginButton = (
    <Button
      href="/login"
      id="login"
      small={isSmallVariant}
      tracking={{
        ui: countly.ui.NAVBAR,
        action: 'Login'
      }}>
      Sign In
    </Button>
    )

  const spinnerButton = (
    <Button
      href="#"
      id="loading-user"
      small={isSmallVariant} >
      <Loading size={SpinnerSize.SMALL} />
    </Button>
  )

  // ================================================ Main Template [Navigation]
  return (
    <section id="section_navigation">
      <div class="grid-noGutter">
        <div class="col">
          <nav id="navigation" class={styles.navigation} ref={containerRef}>

            <div class={ clsx(styles.navBar, "nav-bar") }>
              { isSmallVariant &&
                <div class="menu-toggle">
                  <button onClick={toggleMenu}>
                    <Hamburger aria-label="Toggle Navbar"/>
                  </button>
                </div>
              }

              <div class="site-logo-container">
                <a
                  href="/"
                  title={logoText}
                  class="anchor-wrapper"
                  onClick={onLinkClick}>
                  <SiteLogo class="site-logo-image"/>
                  <div class="site-logo-text">
                    { logoText }
                  </div>
                </a>
              </div>

              <div class={ clsx(styles.navItemsContainer, "nav-items-wrapper") }>
                { navItems.map(item => (
                  <Link
                    href={item.url}
                    key={item.text}
                    onClick={onLinkClick}>
                    { item.text }
                  </Link>
                ))}

                { isLoadingUser ? spinnerButton : (isLoggedIn ? logoutButton : loginButton) }
              </div>

            </div>

            <div
              class={ clsx("mobile-panel", isMenuOpen ? 'open' : '' ) }
              aria-hidden={isSmallVariant && isMenuOpen}>
              <div>
                <a
                  href="/"
                  title={logoText}
                  onClick={onLinkClick}>
                  <SiteLogo />
                </a>

                { navItems.map(item => (
                  <Link
                    href={item.url}
                    key={item.text}
                    class="nav-item">
                    <a onClick={() => toggleMenu()}>
                      { item.text }
                    </a>
                  </Link>
                ))}

                <button
                  class="exit-button"
                  onClick={ () => toggleMenu() }>
                  <Cross />
                </button>
              </div>
            </div>

          </nav>
        </div>
      </div>
    </section>
  )
}

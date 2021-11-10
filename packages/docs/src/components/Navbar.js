import React from 'react'
import { useCallback, useMemo, useRef, useState } from 'react'
import { Magic } from 'magic-sdk'
import Link from '@docusaurus/Link'
import countly from '@web3-storage/website/lib/countly'
import Button from '@site/src/components/button'
import { useResizeObserver } from '@site/sric/hooks/resize-observer'
import clsx from 'clsx'

import Hamburger from '@web3-storage/website/icons/hamburger'
import Logo from '@web3-storage/website/icons/w3storage-logo'
import Cross from '@web3-storage/website/icons/cross'
import Loading from '@web3-storage/website/components/loading.js'

export default function Navbar() {
  const containerRef = useRef(null)
  const [isSmallVariant, setSmallVariant] = useState(false)
  const [isMenuOpen, setMenuOpen] = useState(false)
  const [ isLoggedIn, setIsLoggedIn ] = useState(null)

  const bgColor = ''
  const isLoadingUser = isLoggedIn === null

  const MAGIC_LINK_PUB_KEY = process.env.MAGIC_LINK_PUB_KEY || ''
  const m = new Magic(MAGIC_LINK_PUB_KEY)
  m.user.isLoggedIn()
    .then(isLoggedIn => setIsLoggedIn(isLoggedIn))

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
        link: 'https://web3.storage/docs',
        name: 'Docs',
        spacing: `p-3 md:px-6 ${isLoggedIn ? '' : 'mr-6 md:mr-0'}`
      },
      {
        link: 'https://web3.storage/about',
        name: 'About',
        spacing: `p-3 md:px-6 ${isLoggedIn ? '' : 'mr-6 md:mr-0'}`
      },
      {
        link: 'https://web3.storage/files',
        name: 'Files',
        spacing: `p-3 md:px-6`
      },
      {
        link: 'https://web3.storage/account',
        name: 'Account',
        spacing: `p-3 md:px-6 mr-3 md:mr-6`
      }
    ], [isLoggedIn])

  const onLinkClick = useCallback((event) => {
    countly.trackCustomLinkClick(
      countly.events.LINK_CLICK_NAVBAR,
      event.currentTarget
    )
  }, [])

  const logout = async () => await m.user.logout() 

  const toggleMenu = () => {
    if(isMenuOpen) {
      document.body.classList.remove('overflow-hidden')
      document.body.style.overflow = 'visible'
    }
    else {
      document.body.classList.add('overflow-hidden')
      document.body.style.overflow = 'hidden'
    }
    setMenuOpen(!isMenuOpen)
  }

  const logoutButton = 
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

  const loginButton = (
    <a href="https://web3.storage/login">
      Login
    </a>
    )

  const spinnerButton = (
    <Button href="#" id="loading-user" wrapperClassName="inline-block" small={isSmallVariant} >
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
      <div 
        style={{ backgroundColor: '#0b0a45' }}
        className={clsx(
          "transition-all duration-300 fixed top-0 left-0 bottom-0 shadow-2xl p-6 w-full bg-w3storage-blue-dark",
          isSmallVariant && isMenuOpen ? 'flex justify-center opacity-100 w-screen h-screen sticky' : 'opacity-0 invisible'
      )} aria-hidden={isSmallVariant && isMenuOpen}>
        <div className="flex flex-col align-middle items-center text-center mt-4">
          <a href="/" title="Web3 Storage" className="flex justify-center mb-8">
            <Logo style={{ height: '4rem', minWidth: '4rem' }} className="fill-current text-w3storage-red" />
          </a>
          { ITEMS.map(item => (
              <a className={clsx('space-grotesk text-5xl text-white font-bold no-underline hover:underline align-middle mt-4', item.spacing)} onClick={() => toggleMenu()}>
                <Link href={item.link} key={item.name}>
                  { item.name }
                </Link>
              </a>
          ))}
          <button className="flex justify-center mt-16" onClick={ () => toggleMenu() }>
            <Cross />
          </button>
        </div>
      </div>
    </nav>
  )
}

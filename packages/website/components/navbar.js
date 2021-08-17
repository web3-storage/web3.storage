import { useCallback } from 'react';
import Router from 'next/router'
import Link from 'next/link'
import { getMagic } from '../lib/magic.js'
import countly from '../lib/countly'
import { useQueryClient } from 'react-query'
import Button from './button.js'

/**
 * Navbar Component
 *
 * @param {Object} props
 * @param {string} [props.bgColor]
 * @param {boolean} [props.isLoggedIn]
 * @param {boolean} props.isLoadingUser
 */
export default function Navbar({ bgColor = '', isLoggedIn, isLoadingUser }) {
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

  return (
    <nav className={`${bgColor} w-full z-50`}>
      <div className="flex items-center justify-between py-3 layout-margins">
        <Link href="/">
          <a
            title="Web3 Storage" 
            className="flex items-center"
            onClick={onLinkClick}
          >
            <img src="/w3storage-logo.svg" style={{ height: '1.8rem' }} />
            <span className="space-grotesk ml-2 text-w3storage-purple font-medium text-base hidden xl:inline-block">Web3.Storage</span>
          </a>
        </Link>
        <div className="flex items-center" style={{ minHeight: 52 }}>
          <Link href="https://docs.web3.storage/">
            <a
              className={`text-sm text-w3storage-purple font-bold no-underline hover:underline align-middle p-3 py-3 md:px-6 ${isLoggedIn ? '' : 'mr-6 md:mr-0'}`}
              onClick={onLinkClick}
            >
              Docs
            </a>
          </Link>
          <Link href="/about">
            <a 
              className={`text-sm text-w3storage-purple font-bold no-underline hover:underline align-middle p-3 md:px-6 hidden md:inline-block ${isLoggedIn ? '' : 'md:mr-6'}`}
              onClick={onLinkClick}
            >
              About
            </a>
          </Link>
          {isLoggedIn ? (
            <>
              <Link href="/files">
                <a
                  className="text-sm text-w3storage-purple font-bold no-underline hover:underline align-middle p-3 md:px-6"
                  onClick={onLinkClick}
                >
                  Files
                </a>
              </Link>
              <Link href="/account">
                <a
                  className="text-sm text-w3storage-purple font-bold no-underline hover:underline align-middle p-3 md:px-6 mr-3 md:mr-6"
                  onClick={onLinkClick}
                >
                  Account
                </a>
              </Link>
            </>
          ) : null}
          {isLoadingUser
            ? null
            : isLoggedIn
              ? (
                <Button
                  onClick={logout}
                  id="logout"
                  wrapperClassName="inline-block"
                  variant="outlined"
                  tracking={{
                    event: countly.events.LOGOUT_CLICK,
                    ui: countly.ui.NAVBAR,
                    action: 'Logout'
                  }}
                >
                  Logout
                </Button>
                )
              : (
                <Button
                  href="/login"
                  id="login"
                  wrapperClassName="inline-block"
                  tracking={{ ui: countly.ui.NAVBAR, action: 'Login' }}
                >
                  Login
                </Button>
                )
          }
        </div>
      </div>
    </nav>
  )
}

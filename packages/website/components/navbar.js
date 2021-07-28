import Router from 'next/router'
import Link from 'next/link'
import { getMagic } from '../lib/magic.js'
import { useQueryClient } from 'react-query'
import Button from './button.js'

/**
 * Navbar Component
 *
 * @param {Object} props
 * @param {string} [props.bgColor]
 * @param {any} [props.user]
 * @param {boolean} props.isLoadingUser
 */
export default function Navbar({ bgColor = '', user, isLoadingUser }) {
  const queryClient = useQueryClient()
  async function logout() {
    await getMagic().user.logout()
    await queryClient.invalidateQueries('magic-user')
    Router.push('/')
  }

  return (
    <nav className={`${bgColor} w-full z-50`}>
      <div className="flex items-center justify-between py-3 layout-margins">
        <Link href="/">
          <a title="Web3 Storage" className="flex">
            <img src="/w3storage-logo.svg" style={{ height: '2.4rem' }} />
            <span className="space-grotesk ml-2 text-w3storage-purple font-medium text-3xl hidden xl:inline-block">Web3.Storage</span>
          </a>
        </Link>
        <div className="flex items-center" style={{ minHeight: 52 }}>
          <Link href="https://docs.web3.storage/">
            <a className="text-w3storage-purple font-bold no-underline hover:underline align-middle mr-6 md:mr-12">
              Docs
            </a>
          </Link>
          <Link href="/about">
            <a className="text-w3storage-purple font-bold no-underline hover:underline align-middle mr-12 hidden md:inline-block">
              About
            </a>
          </Link>
          {user ? (
            <>
              <Link href="/files">
                <a className="text-w3storage-purple font-bold no-underline hover:underline align-middle mr-6 md:mr-12">
                  Files
                </a>
              </Link>
              <Link href="/account">
                <a className="text-w3storage-purple font-bold no-underline hover:underline align-middle mr-6 md:mr-12">
                  Account
                </a>
              </Link>
            </>
          ) : null}
          {isLoadingUser
            ? null
            : user
              ? (
                <Button onClick={logout} id="logout" wrapperClassName="inline-block" variant="outlined">
                  Logout
                </Button>
                )
              : (
                <Button href="/login" id="login" wrapperClassName="inline-block">
                  Login
                </Button>
                )
          }
        </div>
      </div>
    </nav>
  )
}

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
 */
export default function Navbar({ bgColor = '', user }) {
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
          <a title="Web3 Storage">⁂</a>
        </Link>
        <div>
          {/* TODO: change docs link before going live */}
          <Link href="https://web3-storage-docs.on.fleek.co/">
            <a className="text-w3storage-purple font-bold no-underline hover:underline align-middle mr-12">
              Docs
            </a>
          </Link>
          <Link href="/about">
            <a className="text-w3storage-purple font-bold no-underline hover:underline align-middle mr-12">
              About
            </a>
          </Link>
          {user ? (
            <>
              <Link href="/files">
                <a className="text-w3storage-purple font-bold no-underline hover:underline align-middle mr-12">
                  Files
                </a>
              </Link>
              <Link href="/profile">
                <a className="text-w3storage-purple font-bold no-underline hover:underline align-middle mr-12">
                  Profile
                </a>
              </Link>
            </>
          ) : null}
          {user ? (
            <Button onClick={logout} id="logout" wrapperClassName="inline-block">
              Logout
            </Button>
          ) : (
            <Button href="/login" id="login" wrapperClassName="inline-block">
              Login
            </Button>
          )}
        </div>
      </div>
    </nav>
  )
}

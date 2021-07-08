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
export default function Navbar({ bgColor = 'white', user }) {
  const queryClient = useQueryClient()
  async function logout() {
    await getMagic().user.logout()
    await queryClient.invalidateQueries('magic-user')
    Router.push('/')
  }

  return (
    <nav className={`bg-${bgColor}`}>
      <div className="flex items-center justify-between ph3 ph5-ns pv3 center mw9">
        <Link href="/" >
          <a className="link f3" title="Web3 Storage">⁂</a>
        </Link>
        <div>
          {user ? (
            <>
              <Link href="/files">
                <a className="f4 black no-underline underline-hover v-mid">
                  Files
                </a>
              </Link>
              <span className="mh2 v-mid b black">•</span>
              <Link href="/tokens">
                <a className="f4 black no-underline underline-hover v-mid">
                  API Tokens
                </a>
              </Link>
              <span className="mh2 v-mid b black">•</span>
            </>
          ) : null}
          <Link href="/#docs">
            <a className="f4 black no-underline underline-hover v-mid mr3">
              Docs
            </a>
          </Link>
          {user ? (
            <Button onClick={logout} id="logout">
              Logout
            </Button>
          ) : (
            <Button href="/login" id="login">
              Login
            </Button>
          )}
        </div>
      </div>
    </nav>
  )
}

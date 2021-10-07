import { useState } from 'react'
import Router from 'next/router'
import { useQueryClient } from 'react-query'
import countly from '../lib/countly'
import { loginEmail, loginSocial } from '../lib/magic.js'
import Button from '../components/button.js'
import GithubIcon from '../icons/github.js'

/**
 * Static Props
 *
 * @returns {{ props: import('../components/types.js').LayoutProps}}
 */
export function getStaticProps() {
  return {
    props: {
      title: 'Login - Web3 Storage',
      redirectTo: '/files',
      redirectIfFound: true,
      pageBgColor: 'bg-w3storage-red',
      navBgColor: 'bg-w3storage-red'
    },
  }
}

export default function Login() {
  const queryClient = useQueryClient()
  const [errorMsg, setErrorMsg] = useState('')
  const [disabled, setDisabled] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)

  /**
   * @param {import('react').ChangeEvent<HTMLFormElement>} e
   */
  async function onSubmit(e) {
    e.preventDefault()

    if (errorMsg) setErrorMsg('')
    setDisabled(true)

    try {
      await loginEmail(e.currentTarget.email.value)
      await queryClient.invalidateQueries('magic-user')
      Router.push('/account')
    } catch (error) {
      setDisabled(false)
      console.error('An unexpected error happened occurred:', error)
      // @ts-ignore Catch clause variable type annotation must be 'any' or 'unknown' if specified.ts(1196)
      setErrorMsg(error.message)
    }
  }
  return (
    <main className="layout-margins">
      <div className="py-4 mt-4 sm:mt-32 text-w3storage-purple">
        <form onSubmit={onSubmit} className="text-center w-100 sm:w-80 mx-auto">
          <label>
            <h3 className="mb-6">Log in with</h3>
          </label>

          <Button
            onClick={() => {
              setIsRedirecting(true)
              loginSocial('github')
            }}
            Icon={GithubIcon}
            tracking={{
              event: countly.events.LOGIN_CLICK,
              ui: countly.ui.LOGIN,
              action: 'Github'
            }}
          >
            {isRedirecting ? 'Redirecting...' : 'GitHub'}
          </Button>

          <h3 className="my-8">Or</h3>

          <input
            type="email"
            name="email"
            required
            placeholder="Enter your email"
            className="w-full border border-black px-4 py-3 placeholder-black"
          />

          <Button
            type="submit"
            disabled={disabled}
            wrapperClassName="mt-2"
            tracking={{
              event: countly.events.LOGIN_CLICK,
              ui: countly.ui.LOGIN,
              action: 'Sign Up / Login'
            }}
          >
            Sign Up / Login
          </Button>

          {errorMsg && <p className="error">{errorMsg}</p>}

          <br />
          <br />
        </form>
      </div>
    </main>
  )
}

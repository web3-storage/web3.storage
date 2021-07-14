import { useState } from 'react'
import Router from 'next/router'
import { loginEmail, loginSocial } from '../lib/magic.js'
import Button from '../components/button.js'
import { useQueryClient } from 'react-query'

export function getStaticProps() {
  return {
    props: {
      title: 'Login - Web3 Storage',
      redirectTo: '/files',
      redirectIfFound: true,
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
      Router.push('/profile')
    } catch (error) {
      setDisabled(false)
      console.error('An unexpected error happened occurred:', error)
      setErrorMsg(error.message)
    }
  }
  return (
    <main>
      <div className="py-4 px-16 mt-32 mx-auto max-w-screen-2xl">
        <form onSubmit={onSubmit} className="text-center w-80 mx-auto">
          <label>
            <h3 className="mb-6">Log in</h3>
          </label>
          <input
            type="email"
            name="email"
            required
            placeholder="Enter your email"
            className="w-full border border-black rounded-md p-2"
          />

          <Button type="submit" disabled={disabled} wrapperClassName="mt-2">
            Sign Up / Login
          </Button>

          {errorMsg && <p className="error">{errorMsg}</p>}

          <h3 className="my-8">Or with</h3>

          <Button
            onClick={() => {
              setIsRedirecting(true)
              loginSocial('github')
            }}
          >
            {isRedirecting ? 'Redirecting...' : 'GitHub'}
          </Button>
          <br />
          <br />
        </form>
      </div>
    </main>
  )
}

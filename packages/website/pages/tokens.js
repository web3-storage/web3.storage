import { useEffect, useState } from 'react'
import { If, Then, Else, When } from 'react-if'
import Button from '../components/button.js'
import { deleteToken, getTokens } from '../lib/api'
import { useQuery, useQueryClient } from 'react-query'
import Loading from '../components/loading.js'

/**
 *
 * @returns {{ props: import('../components/types.js').LayoutProps}}
 */
export function getStaticProps() {
  return {
    props: {
      title: 'Manage API Tokens - web3.storage',
      navBgColor: 'nsgreen',
      redirectTo: '/',
      needsUser: true,
    },
  }
}

/**
 *
 * @param {import('../components/types.js').LayoutChildrenProps} props
 * @returns
 */
export default function Tokens({ user }) {
  const [deleting, setDeleting] = useState('')
  const [copied, setCopied] = useState('')
  const queryClient = useQueryClient()
  const { status, data: tokens } = useQuery('get-tokens', getTokens, {
    enabled: !!user,
    placeholderData: []
  })
  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(''), 5000)
    return () => clearTimeout(timer)
  }, [copied])
  /**
   * @param {import('react').ChangeEvent<HTMLFormElement>} e
   */
  async function handleDeleteToken(e) {
    e.preventDefault()
    const data = new FormData(e.target)
    const _id = data.get('id')
    if (_id && typeof _id === 'string') {
      if (!confirm('Are you sure? Deleted tokens cannot be recovered!')) {
        return
      }

      setDeleting(_id)

      try {
        await deleteToken(_id)
      } finally {
        await queryClient.invalidateQueries('get-tokens')
        setDeleting('')
      }
    }
  }

  /**
   * @param {import('react').ChangeEvent<HTMLFormElement>} e
   */
  async function handleCopyToken(e) {
    e.preventDefault()
    const secret = e.target.dataset.value
    if (!secret) throw new Error('missing token value')
    await navigator.clipboard.writeText(secret)
    setCopied(secret)
  }

  return (
    <main className="bg-nsgreen">
      <div className="mw9 center pv3 ph3 ph5-ns min-vh-100">
        <If condition={status === 'loading'}>
          <Then>
            <Loading></Loading>
          </Then>
          <Else>
            <div className="flex mb3 items-center">
              <h1 className="chicagoflf mv4 flex-auto">API Tokens</h1>
              <Button href="/new-token" className="flex-none" id="new-token">
                + New Token
              </Button>
            </div>
            <When condition={tokens.length > 0}>
              <table className="bg-white ba b--black w-100 collapse mb4">
                <thead>
                  <tr className="bb b--black">
                    <th className="pa2 tl bg-nsgray br b--black w-50">Name</th>
                    <th className="pa2 tl bg-nsgray br b--black w-50">Key</th>
                    <th colSpan={2} className="pa2 tc bg-nsgray" />
                  </tr>
                </thead>
                <tbody>
                  { /* @ts-ignore fixme! */ }
                  {tokens.map((t, k) => (
                    <tr className="bb b--black" key={k}>
                      <td className="pa2 br b--black">{t.name}</td>
                      <td className="pa2 br b--black mw7">
                        <input
                          disabled
                          className="w-100 h2"
                          type="text"
                          id={`value-${t._id}`}
                          value={t.secret}
                        />
                      </td>
                      <td className="pa2">
                        <form data-value={t.secret} onSubmit={handleCopyToken}>
                          <Button
                            className="bg-white black"
                            type="submit"
                            id="copy-key"
                          >
                            {copied === t._id ? 'Copied!' : 'Copy'}
                          </Button>
                        </form>
                      </td>
                      <td className="pa2">
                        <form onSubmit={handleDeleteToken}>
                          <input
                            type="hidden"
                            name="id"
                            id={`token-${t._id}`}
                            value={t._id}
                          />
                          <Button
                            className="bg-red white"
                            type="submit"
                            disabled={Boolean(deleting)}
                            id="delete-token"
                          >
                            {deleting === t._id ? 'Deleting...' : 'Delete'}
                          </Button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </When>
            <When condition={tokens.length === 0}>
              <p className="tc mv5">
                <span className="f1 dib mb3">😢</span>
                <br />
                No API tokens
              </p>
            </When>
          </Else>
        </If>
      </div>
    </main>
  )
}

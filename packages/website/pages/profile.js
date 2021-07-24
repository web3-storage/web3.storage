/* eslint-env browser */
import React, { useState, useEffect } from 'react'
import { useQuery } from 'react-query'
import Link from 'next/link'
import { getTokens } from '../lib/api'
import Button from '../components/button.js'
import VerticalLines from '../illustrations/vertical-lines.js'
// import emailContent from '../content/file-a-request.json'

/**
 * Static Props
 *
 * @returns {{ props: import('../components/types.js').LayoutProps}}
 */
 export function getStaticProps() {
    return {
      props: {
        title: 'Profile - Web3 Storage',
        redirectTo: '/',
        needsUser: true,
      },
    }
}

/**
 * @param {import('../components/types.js').LayoutChildrenProps} props
 */
export default function Profile({ user }) {
  const [copied, setCopied] = useState('')
  const { data } = useQuery('get-tokens', getTokens, {
    enabled: !!user
  })
  /** @type {import('./tokens').Token[]} */
  const tokens = data || []
  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(''), 5000)
    return () => clearTimeout(timer)
  }, [copied])

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

  // const { mail, subject, body } = emailContent
  // const mailTo = `mailto:${mail}?subject=${subject}&body=${encodeURIComponent(body.join('\n'))}`

  return (
    <div className="relative overflow-hidden">
      <div className="layout-margins">
        <main className="max-w-screen-lg mx-auto my-4 lg:my-32 text-w3storage-purple">
          <h3 className="mb-8">Your profile</h3>
          {/* <div>
            <div className="typography-body-title font-medium">
              Storage Capacity: <span className="font-normal ml-2">300 GiB / 1 TiB</span>
            </div>
            <div className="h-9 border border-black w-96 rounded-md mt-4">
              <div className="h-full border rounded-md bg-gray-200" style={{ width: '20%' }} />
            </div>
            <p className="mt-4">
              {'Need more? '}
              <a href={mailTo}>
                <span className="font-bold">
                  {'File a request >'}
                </span>
              </a>
            </p>
          </div> */}
          <div className="mt-10">
            <h3>Getting started</h3>
            <div className="flex gap-x-10 mt-10">
              {tokens.length ? null : (
                <div className="flex flex-col items-center justify-between w-96 h-96 max-w-full bg-white border border-w3storage-red py-12 px-10 text-center">
                  <h3>Create your first API token</h3>
                  <p>
                    Generate an API Token to embed into your projects!
                  </p>
                  <Button href='/new-token'>
                    Create an API Token
                  </Button>
                </div>
              )}
              <div className="flex flex-col items-center justify-between w-96 h-96 max-w-full bg-white border border-w3storage-red py-12 px-10 text-center">
                <h3>Start building</h3>
                <p>
                  Start storing and retrieving files using our client library! See the docs for guides and walkthroughs!
                </p>
                <Button href="https://docs.web3.storage">
                  Explore the docs
                </Button>
              </div>
            </div>
          </div>
          <div className="mt-28">
            <h3 id="api-tokens">API tokens</h3>
            <div className="flex flex-wrap gap-x-14 mt-10">
              <Link href='/new-token'>
                <button type="button" className="flex items-center justify-center text-center bg-w3storage-pink border-w3storage-red w-64 h-60 mb-12 p-9 hover:bg-w3storage-white">
                  <p className="typography-body-title px-8">Create an API token</p>
                </button>
              </Link>
              {tokens.slice(0, 5).map(t => (
                <form
                  key={t._id}
                  data-value={t.secret}
                  onSubmit={handleCopyToken}
                  className="flex flex-col justify-between items-center text-center bg-white border border-w3storage-red w-64 h-60 mb-12 p-9"
                >
                  <p className="typography-body-title px-8">{t.name}</p>
                  <Button type="submit">{copied === t.secret ? 'Copied!' : 'Copy'}</Button>
                </form>
              ))}
            </div>
            <div className="w-64">
              <Button href="/tokens">Manage tokens</Button>
            </div>
          </div>
        </main>
        <div className="absolute top-48 left-0 w-full pointer-events-none" style={{ minWidth: '1536px' }}>
          <div className="w-min ml-auto">
            <VerticalLines />
          </div>
        </div>
      </div>
    </div>
  )
}

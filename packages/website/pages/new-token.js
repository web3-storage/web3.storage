import { useState } from 'react'
import { useRouter } from 'next/router'
import { useQueryClient } from 'react-query'

import Button from '../components/button.js'
import countly from '../lib/countly'
import { createToken } from '../lib/api.js'
import VerticalLines from '../illustrations/vertical-lines.js'

/**
 * Static Props
 *
 * @returns {{ props: import('../components/types.js').LayoutProps}}
 */
export function getStaticProps() {
  return {
    props: {
      title: 'New API Token - Web3 Storage',
      needsLoggedIn: true,
      redirectTo: '/',
    },
  }
}

export default function NewToken() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [creating, setCreating] = useState(false)

  /**
   * @param {import('react').ChangeEvent<HTMLFormElement>} e
   */
  async function handleCreateToken(e) {
    e.preventDefault()
    const data = new FormData(e.target)
    const name = data.get('name')
    if (name && typeof name === 'string') {
      setCreating(true)
      try {
        await createToken(name)
      } finally {
        await queryClient.invalidateQueries('get-tokens')
        setCreating(false)
        router.push('/tokens')
      }
    }
  }

  return (
    <div className="relative overflow-hidden z-0 flex-grow">
      <div className="absolute top-10 right-0 pointer-events-none bottom-0 hidden sm:flex justify-end z-n1">
        <VerticalLines className="h-full"/>
      </div>
      <div className="layout-margins">
        <main className="max-w-screen-lg mx-auto my-4 lg:my-16 text-w3storage-purple">
          <div className="flex flex-col items-center justify-between mx-auto w-96 h-96 max-w-full bg-white border border-w3storage-red py-12 px-10 text-center">
            <h3>New API Token</h3>
            <form onSubmit={handleCreateToken}>
              <div className="my-6">
                <div className="text-left mb-3">
                  <label htmlFor="name">Name</label>
                </div>
                <input
                  id="name"
                  name="name"
                  placeholder="Name your token"
                  className="w-full border border-black px-4 py-3 placeholder-black"
                  required
                />
              </div>
              <div>
                <Button
                  type="submit"
                  disabled={creating}
                  id="create-new-token"
                  tracking={{
                    event: countly.events.TOKEN_CREATE,
                    ui: countly.ui.NEW_TOKEN,
                    action: 'Create new token'
                  }}
                >
                  {creating ? 'Creating...' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}

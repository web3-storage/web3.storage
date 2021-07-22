import { useState } from 'react'
import { useRouter } from 'next/router'
import { useQueryClient } from 'react-query'
import Button from '../components/button.js'
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
      needsUser: true,
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
      } catch (err) {
        console.error(err)
      } finally {
        await queryClient.invalidateQueries('get-tokens')
        setCreating(false)
        router.push('/tokens')
      }
    }
  }

  return (
    <div className="relative overflow-hidden">
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
                  placeholder="Give this API Token a name"
                  className="w-full border border-black px-4 py-3 placeholder-black"
                  required
                />
              </div>
              <div>
                <Button
                  type="submit"
                  disabled={creating}
                  id="create-new-token"
                >
                  {creating ? 'Creating...' : 'Create'}
                </Button>
              </div>
            </form>
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

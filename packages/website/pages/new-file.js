import { getToken, API } from '../lib/api'
import { useRouter } from 'next/router'
import { Web3Storage } from 'web3.storage'
import { useQueryClient } from 'react-query'
import { useState } from 'react'
import Button from '../components/button.js'

export function getStaticProps() {
  return {
    props: {
      title: 'New File - Web3 Storage',
      redirectTo: '/',
      needsUser: true,
    },
  }
}

export default function NewFile() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [uploading, setUploading] = useState(false)
  const [percentComplete, setPercentComplete] = useState(0)

  /**
   * @param {import('react').ChangeEvent<HTMLFormElement>} e
   */
  async function handleUploadSubmit(e) {
    e.preventDefault()
    const data = new FormData(e.target)
    const file = data.get('file')
    if (file && file instanceof File) {
      const client = new Web3Storage({
        token: await getToken(),
        endpoint: new URL(API),
      })
      setUploading(true)
      try {
        let totalBytesSent = 0
        await client.put([file], {
          name: file.name,
          onStoredChunk: size => {
            totalBytesSent += size
            setPercentComplete(Math.round((totalBytesSent / file.size) * 100))
          }
        })
      } finally {
        await queryClient.invalidateQueries('get-uploads')
        setUploading(false)
        router.push('/files')
      }
    }
  }

  return (
    <main className="bg-nsyellow">
      <div className="mw9 center pv3 ph3 ph5-ns min-vh-100">
        <div className="center mv4 mw6">
          <h1 className="chicagoflf f4 fw4">Upload File</h1>
          <form onSubmit={handleUploadSubmit}>
            <div className="mv3">
              <label htmlFor="name" className="dib mb2">
                File:
              </label>
              <input
                id="file"
                name="file"
                type="file"
                className="db ba b--black w5 pa2"
                required
              />
            </div>
            <div className="mv3">
              <Button
                className="bg-nslime"
                type="submit"
                disabled={uploading}
                id="upload-file"
              >
                {uploading
                  ? `Uploading...${percentComplete ? `(${percentComplete}%)` : ''}`
                  : 'Upload'}
              </Button>
            </div>
            <div>
              <p className="lh-copy f7">
                You can also upload files using the{' '}
                <a href="/#js-client" className="black">
                  JS Client Library
                </a>
                {' '}or using{' '}
                <a href="/#raw-http-request" className="black">
                  Raw HTTP Requests
                </a>.
              </p>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}

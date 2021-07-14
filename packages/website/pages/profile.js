import { useCallback, useState } from 'react';
import Button from '../components/button.js'
import Modal from '../components/modal.js'
import emailContent from '../content/file-a-request.json'

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

export default function Profile() {
    const [showModal, setShowModal] = useState(false);

    const { mail, subject, body } = emailContent;
    const mailTo = `mailto:${mail}?subject=${subject}&body=${encodeURIComponent(body.join('\n'))}`

    const openModal = useCallback(
      () => {
        setShowModal(true)
      },
      [],
    )

    return (
        <main className="max-w-screen-2xl mx-auto my-14">
          <div>
            <h3 className="mb-8">Your profile</h3>
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
          </div>
          <div className="mt-10">
            <h3>Getting started</h3>
            <div className="flex gap-x-10 mt-10">
              <div className="flex flex-col items-center justify-between w-96 h-96 max-w-full bg-gray-200 border border-black rounded-md py-12 px-10 text-center">
                <h3>Create your first API key</h3>
                <p>
                  Generate an API key to embed into your projects!
                </p>
                <Button href="/" variant="light">
                  Create an API key
                </Button>
              </div>
              <div className="flex flex-col items-center justify-between w-96 h-96 max-w-full bg-gray-200 border border-black rounded-md py-12 px-10 text-center">
                <h3>Start building</h3>
                <p>
                Start storing and retrieving files using our client library! See the docs for guides and walkthroughs!
                </p>
                <Button href="/" variant="light">
                  Explore the docs
                </Button>
              </div>
            </div>
          </div>
          <div className="mt-28">
            <h3>API keys</h3>
            <div className="flex gap-x-14 mt-10">
              <div className="flex items-center justify-center text-center text-gray-500 bg-gray-200 border rounded-md w-64 h-60 p-9">
                <p className="typography-body-title px-8">Create an API key</p>
              </div>
              <div className="flex flex-col justify-between items-center text-center bg-gray-200 border border-black rounded-md w-64 h-60 p-9">
                <p className="typography-body-title px-8">API key #1</p>
                <Button variant="light" onClick={ openModal }>
                  Delete API key
                </Button>
              </div>
            </div>
          </div>
          <Modal
            onClose={() => setShowModal(false)}
            show={showModal}
          >
            <div className="flex flex-col justify-between items-center h-full">
              <div>
                <p>
                  Please confirm the API key you want to delete.
                </p>
                <input className="w-full mt-8 border border-black rounded-md p-2" placeholder="Enter the name of your API key" />
              </div>
              <Button variant="light" className="w-48">
                Delete API key
              </Button>
            </div>
          </Modal>
        </main>
    )
}
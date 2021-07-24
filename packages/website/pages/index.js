import { useState } from 'react'
import clsx from 'clsx'
import Link from 'next/link'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/cjs/styles/prism';
// @ts-ignore
import { CopyToClipboard } from 'react-copy-to-clipboard'

import Button from '../components/button.js'
import Hero from '../components/hero.js'

import OpenIcon from '../icons/open.js'
import SimpleIcon from '../icons/simple.js'
import ProvableStorage from '../icons/provable-storage.js'
import FreeIcon from '../icons/free.js'
import CopyIcon from '../icons/copy.js'
import Squares from '../illustrations/squares.js'
import GettingStartedIllustration from '../illustrations/getting-started-illustration.js'

/**
 * @returns {{ props: import('../components/types.js').LayoutProps}}
 */
export function getStaticProps() {
  return {
    props: {
      needsUser: false,
      navBgColor: 'bg-w3storage-red',
      footerBgColor: 'bg-w3storage-red',
      highlightMessage: `Looking to store NFTs? Check out <a class="underline" href="https://nft.storage">NFT.Storage</a>!</p>`
    },
  }
}

export default function Home() {
  return (
    <>
      <Hero />
      <main className="z-10">
        <WhyWeb3Storage />
        <GetStarted />
      </main>
    </>
  )
}

function WhyWeb3Storage() {
  const codeSnippets = {
    store: `import { Web3Storage, getFilesFromPath } from 'web3.storage'

const token = 'your-api-token'
const client = new Web3Storage({ token })

async function storeFiles () {
  const files = await getFilesFromPath('./')
  const cid = await client.put(files)
  console.log(cid)
}

storeFiles()`,
    retrieve: `import { Web3Storage } from 'web3.storage'

const token = 'your-api-token'
const client = new Web3Storage({ token })

async function retrieveFiles () {
  const cid =
    'bafybeidd2gyhagleh47qeg77xqndy2qy3yzn4vkxmk775bg2t5lpuy7pcu'
  const res = await client.get(cid)
  const files = await res.files()

  for (const file of files) {
    console.log(\`\${file.cid}: \${file.name} (\${file.size} bytes)\`)
  }
}

retrieveFiles()`
  }

  const [code, setCode] = useState('store')

  const preStyle = 'pre[class*="language-"]';
  tomorrow[preStyle].background = '#2d2d65'
  tomorrow[preStyle].padding = '1.25rem 1.5rem'
  tomorrow[preStyle].marginTop = '0'

  const showCopiedMessage = () => {
    const copied = document.getElementsByClassName('copied')[0];
    copied.classList.remove('opacity-0')
    copied.classList.add('opacity-100')

    setTimeout(function() {
      copied.classList.remove('opacity-100')
      copied.classList.add('opacity-0')
    }, 2000)
  }

  return (
    <div className="layout-margins pt-24">
      <h2 className="text-w3storage-purple text-center bg-w3storage-background border-2 border-w3storage-red px-5 lg:px-10 py-3 lg:py-6 w-max max-w-full mx-auto">
        Why build on Web3.Storage?
      </h2>
      <div className="grid grid-flow-row md:grid-flow-col md:grid-rows-6-auto xl:grid-rows-3-auto items-end gap-x-10 xl:gap-x-12 mt-20 text-w3storage-purple">
          <SimpleIcon />
          <h3 className="relative mt-10">
            <div className="h-5 w-1 absolute -left-4 top-0 mt-1 bg-w3storage-red" />
            Simple
          </h3>
          <p className="mt-8 self-start">Just download the library and start building! No infrastructure or DevOps required.</p>
          <OpenIcon className="mt-20 md:mt-0" />
          <h3 className="relative mt-10">
            <div className="h-5 w-1 absolute -left-4 top-0 mt-1 bg-w3storage-red" />
            Open
          </h3>
          <p className="mt-8 self-start">
            Build applications that are open by design. All data stored is accessible on the public <a className="underline" href="https://ipfs.io">IPFS network</a> - interoperable with the tools and services building on the decentralized web.
          </p>
          <ProvableStorage className="mt-20 md:mt-0" />
          <h3 className="relative mt-10">
            <div className="h-5 w-1 absolute -left-4 top-0 mt-1 bg-w3storage-red" />
            Provable Storage
          </h3>
          <p className="mt-8 self-start">
            Automatically replicate your data across a network of storage providers. Verify the integrity of your data, enabled by Filecoin’s cryptographic proof system.
          </p>
          <FreeIcon className="mt-20 xl:mt-0" />
          <h3 className="relative mt-10">
            <div className="h-5 w-1 absolute -left-4 top-0 mt-1 bg-w3storage-red" />
            Free
          </h3>
          <p className="mt-8 self-start">
            Store and retrieve data from Web3.Storage for free! See our <Link href="/about"><a className="underline">About</a></Link> page for more details.
          </p>
      </div>
      <div className="relative flex flex-col xl:flex-row justify-between px-12 py-12 mt-20 bg-w3storage-purple" style={{ borderTopLeftRadius: '6rem' }}>
        <Squares className="absolute top-14 left-16" />
        <div className="text-white pl-20 pr-5 w-full max-w-none xl:max-w-lg mb-16 mr-0 xl:mr-10 xl:mb-0">
          <h2 className="relative mb-8">
            <div className="h-6 w-0.5 absolute -left-6 top-3 bg-w3storage-red" />
            Decentralized Storage in 5 Minutes
          </h2>
          <p className="max-w-xs mb-8">
            Build on Filecoin in just a few lines of code. Get started in minutes with this simple interface.
          </p>
          <a href="https://docs.web3.storage/quickstart" className="font-bold">{'Learn more >'}</a>
        </div>
        <div className="relative w-full">
          <div className="text-white">
            <button
              type="button"
              onClick={ ()=> setCode('store') }
              className={clsx(
                "typography-cta rounded-t-lg py-2 px-8 mr-2 transition",
                code === 'store' ?
                  "bg-w3storage-blue-desaturated text-white"
                  :
                  "bg-black text-white bg-opacity-30 hover:bg-white hover:bg-opacity-10")}>
              Store
            </button>
            <button
              type="button"
              onClick={ ()=> setCode('retrieve') }
              className={clsx(
                "typography-cta rounded-t-lg py-2 px-8 transition",
                code === 'retrieve' ?
                  "bg-w3storage-blue-desaturated text-white"
                  :
                  "bg-black text-white bg-opacity-30 hover:bg-white hover:bg-opacity-10")}>
                Retrieve
              </button>
          </div>
          <SyntaxHighlighter
            language="javascript"
            style={tomorrow}
            codeTagProps={{ style: { color: '#fff', fontFamily: "'Space Mono', monospace", fontSize: '0.95em' } }}>
            {
              // @ts-ignore
              codeSnippets[code]
            }
          </SyntaxHighlighter>
          <span className="absolute bottom-12 right-16 text-base text-white transition duration-500 ease-in-out copied opacity-0">Copied!</span>
          <CopyToClipboard
            onCopy={showCopiedMessage}
            text={
            // @ts-ignore
            codeSnippets[code]
            }>
            <button className="absolute bottom-10 right-6 p-2">
              <CopyIcon />
            </button>
          </CopyToClipboard>
        </div>
      </div>
    </div>
  )
}

function GetStarted() {
  return (
    <div className="text-w3storage-purple mt-40 overflow-y-hidden pt-24">
      <div className="relative">
        <div className="layout-margins py-32 z-10">
          <h2>Get Started with Web3.Storage</h2>
          <p className="text-lg mt-8">
            Build on decentralized storage in 3 steps, it’s that easy.
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-4 xl:gap-x-12 mt-20">
            <div className="flex flex-col border-4 border-white p-10 mb-10 lg:mb-0">
              <h3 className="mb-12 font-medium">1. Create an account</h3>
              <div className="flex flex-col flex-grow justify-between">
                <p>Sign up using your email address or GitHub handle and create your API Key.</p>
                <Button href="/login" variant="light" wrapperClassName="w-max mt-12">
                  {'Sign Up >'}
                </Button>
              </div>
            </div>
            <div className="flex flex-col border-4 border-white p-10 mb-10 lg:mb-0">
              <h3 className="mb-12 font-medium">2. Install the library</h3>
              <div className="flex flex-col flex-grow justify-between">
                <p>Grab the client library using NPM.</p>
                <Button href="https://docs.web3.storage/quickstart" variant="light" wrapperClassName="w-max mt-12">
                  {'Install >'}
                </Button>
              </div>
            </div>
            <div className="flex flex-col border-4 border-white p-10 mb-10 lg:mb-0">
              <h3 className="mb-12 font-medium">3. Start building</h3>
              <div className="flex flex-col flex-grow justify-between">
                <p>Read the docs and follow our guides to start building on Web3!</p>
                <Button href="https://docs.web3.storage/how-tos/store/" variant="light" wrapperClassName="w-max mt-12">
                  {'Read >'}
                </Button>
              </div>
            </div>
          </div>
        </div>
        <GettingStartedIllustration className="absolute right-28" style={{ top: '-5.9rem' }} />
        <div className="absolute left-0 top-0 bg-w3storage-red w-full h-full z-n1" style={{ borderTopRightRadius: '25rem 15rem' }} />
      </div>
    </div>
  )
}
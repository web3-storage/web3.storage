import { useState } from 'react'
import clsx from 'clsx'
import Link from 'next/link'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/cjs/styles/prism';
// @ts-ignore
import { CopyToClipboard } from 'react-copy-to-clipboard'

import Button from '../components/button'
import Hero from '../components/hero'
import countly from '../lib/countly'

import OpenIcon from '../icons/open'
import SimpleIcon from '../icons/simple'
import ProvableStorage from '../icons/provable-storage'
import FreeIcon from '../icons/free'
import CopyIcon from '../icons/copy'
import Squares from '../illustrations/squares'
import GettingStartedIllustration from '../illustrations/getting-started-illustration'

/**
 * @returns {{ props: import('../components/types.js').LayoutProps}}
 */
export function getStaticProps() {
  return {
    props: {
      needsLoggedIn: false,
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
      <main className="z-10 transform-gpu">
        <WhyWeb3Storage />
        <GetStarted />
      </main>
    </>
  )
}

function WhyWeb3Storage() {
  const codeSnippets = {
    store: `// Name the file \`store.mjs\` so you can use \`import\` with nodejs 
// Run \`npm i web3.storage\` to install this package
import { Web3Storage, getFilesFromPath } from 'web3.storage'

const token = process.env.API_TOKEN
const client = new Web3Storage({ token })

async function storeFiles () {
  const files = await getFilesFromPath('/path/to/file')
  const cid = await client.put(files)
  console.log(cid)
}

storeFiles()
// Now run it with 
// API_TOKEN=YOUR_TOKEN_HERE node ./store.mjs
`,
    retrieve: `// Name the file \`retrieve.mjs\` so you can use \`import\` with nodejs  
// Run \`npm i web3.storage\` to install this package
import { Web3Storage } from 'web3.storage'

const token = process.env.API_TOKEN
const client = new Web3Storage({ token })

async function retrieveFiles () {
  const cid =
    'bafybeidd2gyhagleh47qeg77xqndy2qy3yzn4vkxmk775bg2t5lpuy7pcu'
  // You can fetch data using any CID, even from IPFS Nodes or Gateway URLs!
  const res = await client.get(cid)
  const files = await res.files()

  for (const file of files) {
    console.log(\`\${file.cid}: \${file.name} (\${file.size} bytes)\`)
  }
}

retrieveFiles()
// Now run it with 
// API_TOKEN=YOUR_TOKEN_HERE node ./retrieve.mjs 
`
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
    <>
      <div className="layout-margins mt-24 bg-w3storage-background">
        <h2 className="text-w3storage-purple text-center bg-w3storage-background border-w3storage-red px-5 lg:px-10 py-3 lg:py-6 w-max max-w-full mx-auto" style={{borderWidth: 3}}>
          Why build on Web3.Storage?
        </h2>
        <div className="grid grid-flow-row md:grid-flow-col md:grid-rows-6-auto xl:grid-rows-3-auto items-end gap-x-10 xl:gap-x-12 mt-20 text-w3storage-purple">
          <SimpleIcon className="ml-2" />
          <h3 className="text-xl relative mt-10">
            <div className="h-5 w-1 absolute -left-4 top-0 mt-1 bg-w3storage-red" />
            Simple
          </h3>
          <p className="mt-8 self-start">Just download the library and start building! No infrastructure or DevOps required.</p>
          <OpenIcon className="mt-20 md:mt-0" />
          <h3 className="text-xl relative mt-10">
            <div className="h-5 w-1 absolute -left-4 top-0 mt-1 bg-w3storage-red" />
            Open
          </h3>
          <p className="mt-8 self-start">
            Build applications that are open by design. All data stored is accessible on the public <a className="underline" href="https://ipfs.io">IPFS network</a> - interoperable with the tools and services building on the decentralized web.
          </p>
          <ProvableStorage className="mt-20 md:mt-0" />
          <h3 className="text-xl relative mt-10">
            <div className="h-5 w-1 absolute -left-4 top-0 mt-1 bg-w3storage-red" />
            Provable Storage
          </h3>
          <p className="mt-8 self-start">
            Automatically replicate your data across a network of storage providers. Verify the integrity of your data, enabled by Filecoin’s cryptographic proof system.
          </p>
          <FreeIcon className="mt-20 xl:mt-0" />
          <h3 className="text-xl relative mt-10">
            <div className="h-5 w-1 absolute -left-4 top-0 mt-1 bg-w3storage-red" />
            Free
          </h3>
          <p className="mt-8 self-start">
            Store and retrieve data from Web3.Storage for free! See our <Link href="/about"><a className="underline">About</a></Link> page for more details.
          </p>
        </div>
      </div>
      <div className="md:layout-margins pt-24">
        <div className="relative flex flex-col xl:flex-row justify-between py-20 md:py-12 mt-20 bg-w3storage-blue-dark" style={{ borderTopLeftRadius: '6rem' }}>
          <Squares className="absolute top-14 left-16 hidden md:block" />
          <div className="text-white pl-12 pr-12 md:pl-32 md:pr-0 w-full max-w-none xl:max-w-lg mb-16 mr-0 xl:mr-10 xl:mb-0">
            <h2 className="relative mb-8">
              <div className="h-5 w-1 absolute -left-4 top-1 md:top-2 mt-1 bg-w3storage-red" />
              Decentralized Storage in 5 Minutes
            </h2>
            <p className="max-w-xs mb-8">
              Build applications with data persisted by Filecoin and available over IPFS. Get started in minutes with this simple interface.
            </p>
            <a href="https://docs.web3.storage/#quickstart" className="font-bold underline" target="_blank" rel="noreferrer">
              Follow the Quickstart Guide
            </a>
          </div>
          <div className="relative w-full md:mr-12">
            <div className="text-white pl-6 xl:pl-0">
              <button
                type="button"
                onClick={ ()=> setCode('store') }
                className={clsx(
                  "typography-cta rounded-t-lg py-2 px-8 mr-2 transition",
                  code === 'store' ?
                    "bg-w3storage-blue-desaturated text-white"
                    :
                    "bg-w3storage-blue-desaturated-bright text-white hover:bg-white hover:bg-opacity-20")}>
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
                    "bg-w3storage-blue-desaturated-bright text-white hover:bg-white hover:bg-opacity-20")}>
                  Retrieve
                </button>
            </div>
            <SyntaxHighlighter
              language="javascript"
              style={tomorrow}
              codeTagProps={{ style: { color: '#fff', fontFamily: "'Space Mono', monospace" } }}
              className="text-sm md:text-base"
            >
              {
                // @ts-ignore
                codeSnippets[code]
              }
            </SyntaxHighlighter>
            <span className="absolute bottom-8 right-16 text-base text-white transition duration-500 ease-in-out copied opacity-0">Copied!</span>
            <CopyToClipboard
              onCopy={showCopiedMessage}
              text={
              // @ts-ignore
              codeSnippets[code]
              }>
              <button className="absolute bottom-6 right-6 p-2">
                <CopyIcon fill="#FFF" width="20" />
              </button>
            </CopyToClipboard>
          </div>
        </div>
      </div>
    </>
  )
}

function GetStarted() {
  return (
    <div className="text-w3storage-purple mt-40 overflow-y-hidden pt-24">
      <div className="relative">
        <div className="layout-margins py-32 z-10">
          <h2>Get Started with Web3.Storage</h2>
          <p className="text-lg mt-8">
            Storing data on open, public infrastructure shouldn’t be a battle.
            <br/>
            Start building applications backed by Filecoin in 3 steps, it’s that easy.  
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-4 xl:gap-x-12 mt-20">
            <div className="flex flex-col border-white p-10 mb-10 lg:mb-0" style={{borderWidth: 3}}>
              <h3 className="mb-12 font-medium">1. Create an account</h3>
              <div className="flex flex-col flex-grow justify-between">
                <p>Sign up using your email address or GitHub handle and create your API Key.</p>
                <Button
                  href="/login"
                  variant="light"
                  wrapperClassName="w-max mt-12"
                  tracking={{ ui: countly.ui.HOME_GET_STARTED, action: "Sign Up" }}
                >
                  {'Sign Up >'}
                </Button>
              </div>
            </div>
            <div className="flex flex-col border-white p-10 mb-10 lg:mb-0" style={{borderWidth: 3}}>
              <h3 className="mb-12 font-medium">2. Install the library</h3>
              <div className="flex flex-col flex-grow justify-between">
                <p>Grab the client library using NPM.</p>
                <Button
                  href="https://docs.web3.storage/#quickstart"
                  variant="light"
                  wrapperClassName="w-max mt-12"
                  tracking={{ ui: countly.ui.HOME_GET_STARTED, action: "Install" }}
                >
                  {'Install >'}
                </Button>
              </div>
            </div>
            <div className="flex flex-col border-white p-10 mb-10 lg:mb-0" style={{borderWidth: 3}}>
              <h3 className="mb-12 font-medium">3. Start building</h3>
              <div className="flex flex-col flex-grow justify-between">
                <p>Read the docs and follow our guides to start building on Web3!</p>
                <Button
                  href="https://docs.web3.storage/how-tos/store/"
                  variant="light"
                  wrapperClassName="w-max mt-12"
                  tracking={{ ui: countly.ui.HOME_GET_STARTED, action: "Read" }}
                >
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
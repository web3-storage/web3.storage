import Button from '../components/button.js'
import Hero from '../components/hero.js'

/**
 * @returns {{ props: import('../components/types.js').LayoutProps}}
 */
export function getStaticProps() {
  return {
    props: {
      needsUser: false,
    },
  }
}

export default function Home() {
  return (
    <>
      <Hero />
      <main>
        <StoreNFTs />
        <WhyWeb3Storage />
        <GetStarted />
        <CTA />
      </main>
    </>
  )
}

function StoreNFTs() {
  return (
    <div className="flex items-center justify-center h-16 bg-gray-200 mt-10 mx-auto">
      <p className="text-2xl">Looking to store NFTs? Check out <a href="https://nft.storage">NFT.Storage</a>!</p>
    </div>
  )
}

function WhyWeb3Storage() {
  return (
    <div className="my-20 max-w-screen-2xl mx-auto">
      <h2 className="text-center">Why build on Web3.Storage?</h2>
      <div className="grid grid-cols-4 gap-x-6 w-full mt-20">
        <div>
          <img src="https://via.placeholder.com/366x366" />
          <h3 className="mt-10">Interoperable</h3>
          <p className="mt-8">All data stored via Web3.Storage is accessible via the IPFS network. Retrieve your data from public gateways, your personal nodes, or directly from the browser.</p>
        </div>
        <div>
          <img src="https://via.placeholder.com/366x366" />
          <h3 className="mt-10">Verifiable</h3>
          <p className="mt-8">Use <a href="/">content addressability</a> to create immutable links to your content regardless of where it’s stored. Know that the content you request is the content you receive.</p>
        </div>
        <div>
          <img src="https://via.placeholder.com/366x366" />
          <h3 className="mt-10">Provable Storage</h3>
          <p className="mt-8">All data in Web3.Storage is backed up redundantly on Filecoin - offering cryptographic proofs of the integrity of all data, stored across multiple providers.</p>
        </div>
        <div>
          <img src="https://via.placeholder.com/366x366" />
          <h3 className="mt-10">Free</h3>
          <p className="mt-8">Store and retrieve your data with Web3.Storage at no cost. See our <a href="/about">About</a> page for more details.</p>
        </div>
      </div>
      <div className="flex items-center justify-center mt-20">
        <div className="mr-32 max-w-sm">
          <h3 className="mb-8">Distributed Storage in 5 Minutes</h3>
          <p className="max-w-xs mb-8">Content stored via Web3.Storage leverages the power of Filecoin and IPFS in the friendliest experience for devs. Get the power of provable, peristent storage in just a few lines of code.</p>
          <a href="/" className="font-bold">{'Learn more >'}</a>
        </div>
        <img src="https://via.placeholder.com/630x472" />
      </div>
    </div>
  )
}

function GetStarted() {
  return (
    <div className="max-w-screen-2xl mx-auto mb-40">
      <h2 className="space-grotesk text-4xl">Get Started with Web3.Storage</h2>
      <p className="text-lg mt-8">Start building on Web3 in 3 easy steps, no additional infrastructure required.</p>
      <div className="grid grid-cols-3 gap-x-12 mt-20">
        <div className="border border-block border-opacity-30 rounded-md px-10 py-24 bg-gray-200">
          <h3 className="mb-12">1. Create an account</h3>
          <p><a href="/">Sign up</a> using your email address or Github handle and create your API Key.</p>
        </div>
        <div className="border border-block border-opacity-30 rounded-md px-10 py-24 bg-gray-200">
          <h3 className="mb-12">2. Install the library</h3>
          <p>Grab the client library from <a href="/">GitHub</a> or NPM.</p>
        </div>
        <div className="border border-block border-opacity-30 rounded-md px-10 py-24 bg-gray-200">
          <h3 className="mb-12">3. Start building</h3>
          <p>Read the <a href="/">docs</a> and follow our guides to start building on Web3!</p>
        </div>
      </div>
    </div>
  )
}

function CTA() {
  return (
    <div className="mx-auto text-center mb-56">
      <h3 className="mb-10">Ready to Get Started?</h3>
      <Button
            href="#ready-to-get-started"
            id="ready-to-get-started"
            wrapperClassName="flex mx-auto w-48"
          >
            {"Let's Go"}
          </Button>
    </div>
  )
}
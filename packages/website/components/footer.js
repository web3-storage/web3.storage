import Link from 'next/link'
export default function Footer() {
  return (
    <footer className="mt-auto text-w3storage-purple">
      <div className="layout-margins flex flex-col xl:flex-row items-left xl:items-center justify-between py-8">
        <div className="text-lg mb-4 xl:mb-0">
          Made with ❤️ by{' '}
          <a
            href="https://protocol.ai/"
            className="font-bold no-underline hover:underline"
          >
            Protocol Labs
          </a>
        </div>
        <div className="flex flex-col sm:flex-row">
          <Link href="https://web3-storage.statuspage.io/">
            <a className="font-bold no-underline hover:underline mr-6 md:mr-12">
              Status
            </a>
          </Link>
          <Link href="/terms">
            <a className="font-bold no-underline hover:underline mr-6 md:mr-12">
              Terms of Service
            </a>
          </Link>
          <Link href="https://github.com/web3-storage/web3.storage/issues/new">
            <a className="font-bold no-underline hover:underline mr-6 md:mr-12" target="_blank" rel="noreferrer">
              Open an issue
            </a>
          </Link>
          <Link href="/">
            <a className="font-bold no-underline hover:underline">
              Join us on Slack
            </a>
          </Link>
        </div>
      </div>
    </footer>
  )
}

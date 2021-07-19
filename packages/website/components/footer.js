import Link from 'next/link'
export default function Footer() {
  return (
    <footer className="flex flex-col lg:flex-row items-left lg:items-center justify-between px-8 py-8 max-w-screen-2xl mx-auto mt-auto w-full text-w3storage-purple">
      <div>
        <span className="text-lg">
          Made with ❤️ by{' '}
          <a
            href="https://protocol.ai/"
            className="font-bold no-underline hover:underline"
          >
            Protocol Labs
          </a>
        </span>
      </div>
      <div className="flex flex-col lg:flex-row">
        <Link href="/terms">
          <a className="font-bold no-underline hover:underline mr-16">
            Terms of Service
          </a>
        </Link>
        <Link href="https://github.com/web3-storage/web3.storage/issues/new">
          <a className="font-bold no-underline hover:underline mr-16" target="_blank" rel="noreferrer">
            File an issue
          </a>
        </Link>
        <Link href="/">
          <a className="font-bold no-underline hover:underline mr-16">
            Feedback
          </a>
        </Link>
        <Link href="/">
          <a className="font-bold no-underline hover:underline">
            Join us on Slack
          </a>
        </Link>
      </div>
    </footer>
  )
}

import Link from 'next/link'
export default function Footer() {
  return (
    <footer className="flex items-center justify-between py-8 max-w-screen-2xl mx-auto mt-auto w-full">
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
      <div>
        <span className="db db-m dib-ns mv3">
          <a
            href="https://status.web3.storage/"
            className="font-bold no-underline hover:underline mr-6"
            target="_blank"
            rel="noreferrer"
          >
            Status
          </a>
        </span>
        <Link href="/terms">
          <a className="font-bold no-underline hover:underline mr-8">
            Terms of Service
          </a>
        </Link>
        <span>Need Help?{' '}</span>
        <a
          href="https://github.com/web3-storage/web3.storage/issues/new"
          className="font-bold no-underline hover:underline"
        >
          Open an Issue
        </a>
      </div>
    </footer>
  )
}

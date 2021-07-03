import Link from 'next/link'
export default function Footer() {
  return (
    <footer className="bg-black db db-m flex-ns items-center justify-between f7 white pv3 ph5">
      <div>
        <span className="db db-m dib-ns mv3">
          Made with ❤️ by{' '}
          <a
            href="https://protocol.ai/"
            className="white underline-hover no-underline"
          >
            Protocol Labs
          </a>
        </span>
      </div>
      <div>
        <span className="db db-m dib-ns mv3">
          <a
            href="https://status.web3.storage/"
            className="white no-underline underline-hover v-mid"
            target="_blank"
            rel="noreferrer"
          >
            Status
          </a>
        </span>
        <Dot />
        <span className="db db-m dib-ns mv3">
          <Link href="/terms">
            <a className="white no-underline underline-hover v-mid">
              Terms of Service
            </a>
          </Link>
        </span>
        <Dot />
        <span className="db db-m dib-ns mv3">
          Need Help?{' '}
          <a
            href="https://github.com/web3-storage/web3.storage/issues/new"
            className="white underline-hover no-underline"
          >
            Open an Issue
          </a>
        </span>
      </div>
    </footer>
  )
}

function Dot() {
  return <span className="mh2 b dn dn-m dib-ns mv3">•</span>
}

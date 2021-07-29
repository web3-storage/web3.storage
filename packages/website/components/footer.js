import Link from 'next/link'

/**
 * Footer Component
 *
 * @param {Object} props
 * @param {string} [props.bgColor]
 */
export default function Footer({ bgColor = '' }) {
  return (
    <footer className={`${bgColor} mt-auto text-w3storage-purple`}>
      <div className="layout-margins flex flex-col xl:flex-row items-left xl:items-center justify-between py-8">
        <div className="text-lg mt-4 order-2 xl:order-1 xl:mt-0">
          Made with 💛 by{' '}
          <a
            href="https://protocol.ai/"
            className="font-bold no-underline hover:underline"
          >
            Protocol Labs
          </a>
        </div>
        <div className="flex flex-col order-1 xl:order-2 sm:flex-row">
          <Link href="https://web3-storage.statuspage.io/">
            <a className="text-sm font-bold no-underline hover:underline mr-6 md:mr-12">
              Status
            </a>
          </Link>
          <Link href="/about/#terms-of-service">
            <a className="text-sm font-bold no-underline hover:underline mr-6 md:mr-12">
              Terms of service
            </a>
          </Link>
          <Link href="https://github.com/web3-storage/web3.storage/issues/new/choose">
            <a className="text-sm font-bold no-underline hover:underline mr-6 md:mr-12" target="_blank" rel="noreferrer">
              Open an issue
            </a>
          </Link>
          <Link href="https://docs.web3.storage/community/help-and-support/">
            <a className="text-sm font-bold no-underline hover:underline">
              Contact us
            </a>
          </Link>
        </div>
      </div>
    </footer>
  )
}

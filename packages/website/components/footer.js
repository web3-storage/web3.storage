import { useCallback } from 'react'
import Link from 'next/link'

import countly from '../lib/countly'

/**
 * Footer Component
 *
 * @param {Object} props
 * @param {string} [props.bgColor]
 */
export default function Footer({ bgColor = '' }) {
  const onLinkClick = useCallback((event) => {
    countly.trackCustomLinkClick(
      countly.events.LINK_CLICK_FOOTER,
      event.currentTarget
    )
  }, [])

  return (
    <footer className={`${bgColor} mt-auto text-w3storage-purple`}>
      <div className="layout-margins flex flex-col xl:flex-row items-left xl:items-center justify-between py-8">
        <div className="text-sm mt-4 order-2 xl:order-1 xl:mt-0">
          Made with 💛 by{' '}
          <a
            href="https://protocol.ai/"
            className="font-bold no-underline hover:underline"
            onClick={onLinkClick}
          >
            Protocol Labs
          </a>
        </div>
        <div className="flex flex-col order-1 xl:order-2 sm:flex-row mx-0 sm:-mx-3">
          <Link href="https://status.web3.storage/">
            <a
              className="text-sm font-bold no-underline hover:underline py-3 sm:px-3"
              onClick={onLinkClick}
            >
              Status
            </a>
          </Link>
          <Link href="/about/#terms-of-service">
            <a
              className="text-sm font-bold no-underline hover:underline py-3 sm:px-3"
              onClick={onLinkClick}
            >
              Terms of service
            </a>
          </Link>
          <Link href="https://github.com/web3-storage/web3.storage/issues/new/choose">
            <a
              className="text-sm font-bold no-underline hover:underline py-3 sm:px-3"
              target="_blank"
              rel="noreferrer"
              onClick={onLinkClick}
            >
              Open an issue
            </a>
          </Link>
          <Link href="https://docs.web3.storage/community/help-and-support/">
            <a
              className="text-sm font-bold no-underline hover:underline py-3 sm:px-3"
              onClick={onLinkClick}
            >
              Contact us
            </a>
          </Link>
        </div>
      </div>
    </footer>
  )
}

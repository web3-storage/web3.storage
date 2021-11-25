// ===================================================================== Imports
import { useCallback } from 'react'
import countly from 'Lib/countly'
import Link from 'next/link'

import { ReactComponent as SiteLogo } from 'Icons/w3storage-logo.svg'
import Button from '../button/button.js'
import Squiggle from '../../assets/illustrations/squiggle'

import GeneralPageData from '../../content/pages/general'

// ====================================================================== Params
/**
 * Footer Component
 *
 * @param {Object} props
 * @param {string} [props.bgColor]
 */
 // ===================================================================== Exports
export default function Footer() {
  const contact = GeneralPageData.footer.contact
  const resources = GeneralPageData.footer.resources
  const getStarted = GeneralPageData.footer.get_started
  const tracking = {
    ui: countly.ui[contact.cta.tracking],
    action: contact.cta.tracking.action
  }

  // ================================================================= Functions
  const onLinkClick = useCallback((event) => {
    countly.trackCustomLinkClick(
      countly.events.LINK_CLICK_FOOTER,
      event.currentTarget
    )
  }, [])

  // ========================================================= Template [Footer]
  return (
    <footer id="site-footer">
      <section class="site-footer-section">

        <Squiggle id="footer_squiggle"/>

        <div class="grid-middle">
          <div class="col-10" data-push-left="off-1">
            <div class="footer_columns" data-push-left="off-1">

              <div class="footer_contact">
                <div class="footer_logo-container">
                  <SiteLogo class="site-logo-image"/>
                  <div class="site-logo-text">
                    { contact.logo_text }
                  </div>
                </div>
                <div class="prompt">
                  { contact.prompt }
                </div>
                { typeof contact.cta === 'object' &&
                  <Button
                    href={contact.cta.url}
                    variant={contact.cta.variant}
                    tracking={tracking}>
                      {contact.cta.text}
                  </Button>
                }
              </div>

              <div class="footer_resources">
                <div class="label">
                  { resources.heading }
                </div>
                { resources.items.map(item => (
                  <Link
                    href={item.url}
                    key={item.text}
                    onClick={onLinkClick}>
                    { item.text }
                  </Link>
                ))}
              </div>

              <div class="footer_get-started">
                <div class="label">
                  { getStarted.heading }
                </div>
                { getStarted.items.map(item => (
                  <Link
                    href={item.url}
                    key={item.text}
                    onClick={onLinkClick}>
                    { item.text }
                  </Link>
                ))}
              </div>

            </div>
          </div>
        </div>
      </section>
    </footer>
  )
}

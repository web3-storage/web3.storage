// ===================================================================== Imports
import { useCallback } from 'react';
import Link from 'next/link';

import SiteLogo from '../../assets/icons/w3storage-logo.js';
import Button from '../button/button.js';
import Squiggle from '../../assets/illustrations/squiggle';
import GeneralPageData from '../../content/pages/general.json';
// import countly from 'Lib/countly'
// ===================================================================== Exports
export default function Footer() {
  const contact = GeneralPageData.footer.contact;
  const resources = GeneralPageData.footer.resources;
  const getStarted = GeneralPageData.footer.get_started;
  const copyright = GeneralPageData.footer.copyright;
  const tracking = {
    // ui: countly.ui[contact.cta.tracking],
    // action: contact.cta.tracking.action
  };

  // ================================================================= Functions
  const onLinkClick = useCallback(event => {
    console.log('clicked');
    // countly.trackCustomLinkClick(
    //   countly.events.LINK_CLICK_FOOTER,
    //   event.currentTarget
    // )
  }, []);

  // ========================================================= Template [Footer]
  return (
    <footer id="site-footer">
      <section id="site-footer-section">
        <Squiggle id="footer_squiggle" />

        <div className="grid-middle">
          <div className="col-10" data-push-left="off-1">
            <div className="footer_columns" data-push-left="off-1">
              <div className="footer_contact">
                <div className="footer_logo-container">
                  <SiteLogo />
                  <div className="site-logo-text">{contact.logo_text}</div>
                </div>
                <div className="prompt">{contact.prompt}</div>
                {typeof contact.cta === 'object' && (
                  <Button href={contact.cta.url} variant={contact.cta.variant} tracking={tracking}>
                    {contact.cta.text}
                  </Button>
                )}
              </div>

              <div className="footer_resources">
                <div className="label">{resources.heading}</div>
                {resources.items.map(item => (
                  <Link href={item.url} key={item.text} onClick={onLinkClick}>
                    {item.text}
                  </Link>
                ))}
              </div>

              <div className="footer_get-started">
                <div className="label">{getStarted.heading}</div>
                {getStarted.items.map(item => (
                  <Link href={item.url} key={item.text} onClick={onLinkClick}>
                    {item.text}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div id="section_copyright" className="noGrid">
          <div className="grid">
            <div className="copyright_container">
              <div className="copyright_left">{copyright.left.text}</div>
              <div className="copyright_right">
                {copyright.right.text}
                <a href={copyright.right.link.url} className="copyright_link">
                  {copyright.right.link.text}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </footer>
  );
}

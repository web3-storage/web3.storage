// ===================================================================== Imports
import { useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

import SiteLogo from '../../assets/icons/w3storage-logo.js';
import Button from '../button/button';
import Squiggle from '../../assets/illustrations/squiggle.js';
import GeneralPageData from '../../content/pages/general.json';
import { trackCustomLinkClick, events } from 'lib/countly';
// ===================================================================== Exports
export default function Footer() {
  const router = useRouter();
  const contact = GeneralPageData.footer.contact;
  const resources = GeneralPageData.footer.resources;
  const getStarted = GeneralPageData.footer.get_started;
  const copyright = GeneralPageData.footer.copyright;

  // ================================================================= Functions
  const onLinkClick = useCallback(e => {
    trackCustomLinkClick(events.LINK_CLICK_FOOTER, e.currentTarget);
  }, []);

  const handleButtonClick = useCallback(
    cta => {
      if (cta.url) {
        router.push(cta.url);
      }
    },
    [router]
  );

  const handleKeySelect = useCallback(
    (e, url) => {
      onLinkClick(e);
      router.push(url);
    },
    [router, onLinkClick]
  );

  // ========================================================= Template [Footer]
  return (
    <footer id="site-footer">
      <section id="site-footer-section">
        <Squiggle id="footer_squiggle" />

        <div className="grid">
          <div className="col-4_sm-8_mi-12" data-push-left="off-1_sm-1_mi-0">
            <div className="footer_contact">
              <div className="footer_logo-container">
                <SiteLogo />
                <div className="site-logo-text">{contact.logo_text}</div>
              </div>
              <div className="prompt">{contact.prompt}</div>
              {typeof contact.cta === 'object' && (
                <Button
                  className={'cta'}
                  variant={/** @type {any} */ (contact.cta.theme)}
                  onClick={() => handleButtonClick(contact.cta)}
                  onKeyPress={() => handleButtonClick(contact.cta)}
                  tracking={{
                    event: 'LINK_CLICK_FOOTER',
                    action: 'Sign up',
                  }}
                >
                  {contact.cta.text}
                </Button>
              )}
            </div>
          </div>

          <div className="col-3_sm-5_mi-8" data-push-left="off-0_sm-2_mi-3">
            <div className="footer_resources">
              <div className="label">{resources.heading}</div>
              {resources.items.map(item => (
                <Link href={item.url} key={item.text} passHref>
                  <button className="footer-link" onClick={onLinkClick} onKeyPress={e => handleKeySelect(e, item.url)}>
                    {item.text}
                  </button>
                </Link>
              ))}
            </div>
          </div>

          <div className="col-4_sm-5_mi-8" data-push-left="off-0_mi-3">
            <div className="footer_get-started">
              <div className="label">{getStarted.heading}</div>
              {getStarted.items.map(item => (
                <Link href={item.url} key={item.text} passHref>
                  <button className="footer-link" onClick={onLinkClick} onKeyPress={e => handleKeySelect(e, item.url)}>
                    {item.text}
                  </button>
                </Link>
              ))}
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

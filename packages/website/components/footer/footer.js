// ===================================================================== Imports
import { useCallback } from 'react';
import { useRouter } from 'next/router';
import clsx from 'clsx';

import { events, saEvent } from '../../lib/analytics';
import Link, { useIsExternalHref } from '../link/link';
import SiteLogo from '../../assets/icons/w3storage-logo.js';
import Button from '../button/button';
import Img from '../cloudflareImage.js';
import ImageSquiggle from '../../public/images/illustrations/squiggle.png';
import GeneralPageData from '../../content/pages/general.json';

// ====================================================================== Params
/**
 * Footer Component
 *
 * @param {Object} props
 * @param {Boolean} props.isProductApp
 */
// ===================================================================== Exports
export default function Footer({ isProductApp }) {
  const router = useRouter();
  const contact = GeneralPageData.footer.contact;
  const resources = GeneralPageData.footer.resources;
  const getStarted = GeneralPageData.footer.get_started;
  const copyright = GeneralPageData.footer.copyright;
  const isExternalHref = useIsExternalHref();
  const getLinkTarget = useCallback(href => (isExternalHref(href) ? '_blank' : undefined), [isExternalHref]);

  // ================================================================= Functions
  const onLinkClick = useCallback(e => {
    saEvent(events.LINK_CLICK_FOOTER, { target: e.currentTarget });
  }, []);

  const handleButtonClick = useCallback(
    cta => {
      if (cta.url) {
        router.push(cta.url);
      }
    },
    [router]
  );

  // ========================================================= Template [Footer]
  return (
    <footer id="site-footer" className={clsx(isProductApp ? 'clear-bg' : '')}>
      <section id="site-footer-section">
        <div id="footer_squiggle">
          <Img alt="" src={ImageSquiggle} />
        </div>

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
                <Link
                  href={item.url}
                  key={item.text}
                  className="footer-link"
                  onClick={onLinkClick}
                  target={getLinkTarget(item.url)}
                >
                  {item.text}
                </Link>
              ))}
            </div>
          </div>

          <div className="col-4_sm-5_mi-8" data-push-left="off-0_mi-3">
            <div className="footer_get-started">
              <div className="label">{getStarted.heading}</div>
              {getStarted.items.map(item => (
                <Link
                  className="footer-link"
                  href={item.url}
                  key={item.text}
                  onClick={onLinkClick}
                  target={getLinkTarget(item.url)}
                >
                  {item.text}
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

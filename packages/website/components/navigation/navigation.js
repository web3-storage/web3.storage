// ===================================================================== Imports
import { useCallback, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import clsx from 'clsx';
import Link from 'next/link';

import { useAuthorization } from 'components/contexts/authorizationContext';
import ZeroAccordion from 'ZeroComponents/accordion/accordion';
import ZeroAccordionSection from 'ZeroComponents/accordion/accordionSection';
import Button from '../button/button';
import SiteLogo from '../../assets/icons/w3storage-logo.js';
import Hamburger from '../../assets/icons/hamburger.js';
import GeneralPageData from '../../content/pages/general.json';
import { trackCustomLinkClick, events } from 'lib/countly';
// import Loading, { SpinnerSize } from '../loading/loading';
// ====================================================================== Params
/**
 * Navbar Component
 *
 * @param {Object} props
 */

// ===================================================================== Exports
export default function Navigation() {
  const router = useRouter();
  const { isLoggedIn, isLoading, isFetching, logout } = useAuthorization();
  const isLoadingUser = useMemo(() => isLoading || isFetching, [isLoading, isFetching]);
  // component State
  const [isMenuOpen, setMenuOpen] = useState(false);
  // Navigation Content
  const navItems = GeneralPageData.navigation.links;
  const auth = GeneralPageData.navigation.auth;
  const logoText = GeneralPageData.site_logo.text;
  const theme = router.route === '/tiers' ? 'light' : 'dark';
  // ================================================================= Functions

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };

  const onLinkClick = useCallback(event => {
    trackCustomLinkClick(events.LINK_CLICK_NAVBAR, event.currentTarget);
  }, []);

  const login = useCallback(() => {
    router.push('/login');
  }, [router]);

  // ======================================================= Templates [Buttons]
  const getNavLinkOrHeader = item => {
    if (Array.isArray(item.links)) {
      return <div className="nav-item-heading">{item.text}</div>;
    }
    return (
      <Link href={item.url} key={item.text} className="nav-item" onClick={onLinkClick}>
        {item.text}
      </Link>
    );
  };

  const logoutButton = button => {
    return (
      <Button onClick={logout} id="logout" variant={theme}>
        {button.logout.text}
      </Button>
    );
  };

  const loginButton = button => {
    return (
      <Button onClick={login} id="login" variant={theme}>
        {button.login.text}
      </Button>
    );
  };

  const loadingButton = (
    <Button href="#" id="loading-user">
      loading
    </Button>
  );

  // ================================================ Main Template [Navigation]
  return (
    <section id="section_navigation" className={clsx('section-navigation', theme)}>
      <div className="grid-noGutter">
        <div className="col">
          <nav id="navigation">
            <div className={clsx('nav-bar', isMenuOpen ? 'mobile-panel' : '')}>
              <div className={clsx('site-logo-container', theme, isMenuOpen ? 'menu-open' : '')}>
                <a href="/" title={logoText} className="anchor-wrapper" onClick={onLinkClick}>
                  <SiteLogo className="site-logo-image" />
                  <div className="site-logo-text">{logoText}</div>
                </a>
              </div>

              <div className={clsx('nav-items-wrapper', theme)}>
                {navItems.map(item => (
                  <Link href={item.url} key={item.text} className="nav-item" onClick={onLinkClick}>
                    {item.text}
                  </Link>
                ))}

                {isLoadingUser ? loadingButton : isLoggedIn ? logoutButton(auth) : loginButton(auth)}
              </div>

              <div className={clsx('nav-menu-toggle', theme, isMenuOpen ? 'menu-open' : '')}>
                <button onClick={toggleMenu}>
                  <Hamburger aria-label="Toggle Navbar" />
                </button>
              </div>
            </div>

            <div className={clsx('nav-mobile-panel', isMenuOpen ? 'open' : '')} aria-hidden={isMenuOpen}>
              <div className="mobile-items-wrapper">
                <ZeroAccordion multiple={true}>
                  {navItems.map((item, index) => (
                    <ZeroAccordionSection key={`mobile-${item.text}`} disabled={!Array.isArray(item.links)}>
                      <ZeroAccordionSection.Header>{getNavLinkOrHeader(item)}</ZeroAccordionSection.Header>

                      <ZeroAccordionSection.Content>
                        {Array.isArray(item.links) && (
                          <div className="nav-sublinks-wrapper">
                            {item.links.map(link => (
                              <Link href={link.url} key={link.text} className="nav-sublink" onClick={onLinkClick}>
                                {link.text}
                              </Link>
                            ))}
                          </div>
                        )}
                      </ZeroAccordionSection.Content>
                    </ZeroAccordionSection>
                  ))}
                </ZeroAccordion>

                {isLoadingUser ? loadingButton : isLoggedIn ? logoutButton(auth) : loginButton(auth)}
              </div>
            </div>
          </nav>
        </div>
      </div>
    </section>
  );
}

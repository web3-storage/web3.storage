// ===================================================================== Imports
import { useCallback, useState } from 'react';
import { useRouter } from 'next/router';
import clsx from 'clsx';
import Link from 'next/link';

import ZeroAccordion from 'ZeroComponents/accordion/accordion';
import ZeroAccordionSection from 'ZeroComponents/accordion/accordionSection';
import Button from '../button/button';
import SiteLogo from '../../assets/icons/w3storage-logo.js';
import Hamburger from '../../assets/icons/hamburger.js';
import GeneralPageData from '../../content/pages/general.json';
// import { getMagic } from '../../lib/magic.js';
// import { countly, trackCustomLinkClick, events, ui } from '../../lib/countly';
// import Loading, { SpinnerSize } from '../loading/loading';
// ====================================================================== Params
/**
 * Navbar Component
 *
 * @param {Object} props
 * @param {boolean} [props.isLoggedIn]
 * @param {boolean} props.isLoadingUser
 */

// ===================================================================== Exports
export default function Navigation({ isLoggedIn, isLoadingUser }) {
  const router = useRouter();
  // component State
  const [isMenuOpen, setMenuOpen] = useState(false);
  // Navigation Content
  const navItems = GeneralPageData.navigation.links;
  const navCTA = GeneralPageData.navigation.cta;
  const logoText = GeneralPageData.site_logo.text;
  const theme = router.route === '/tiers' ? 'light' : 'dark';

  // ================================================================= Functions

  const toggleMenu = () => {
    // isMenuOpen ? document.body.classList.remove('overflow-hidden') : document.body.classList.add('overflow-hidden')
    setMenuOpen(!isMenuOpen);
  };

  // const queryClient = useQueryClient()

  const onLinkClick = useCallback(event => {
    console.log('clicked');
    // countly.trackCustomLinkClick(countly.events.LINK_CLICK_NAVBAR, event.currentTarget);
  }, []);

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

  // async function logout() {
  //   await getMagic().user.logout();
  //   await queryClient.invalidateQueries('magic-user');
  //   Router.push('/');
  // }

  // ======================================================= Templates [Buttons]
  // const logoutButton = (
  //   <Button
  //     onClick={logout}
  //     id="logout"
  //     variant="outlined"
  //     tracking={{
  //       event: countly.events.LOGOUT_CLICK,
  //       ui: countly.ui.NAVBAR,
  //       action: 'Logout',
  //     }}
  //   >
  //     Sign Out
  //   </Button>
  // );
  //
  // const loginButton = (
  //   <Button
  //     href="/login"
  //     id="login"
  //     tracking={{
  //       ui: countly.ui.NAVBAR,
  //       action: 'Login',
  //     }}
  //   >
  //     Sign In
  //   </Button>
  // );
  //
  // const spinnerButton = (
  //   <Button href="#" id="loading-user">
  //     <Loading size={SpinnerSize.SMALL} />
  //   </Button>
  // );

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
                <Button href={navCTA.url} id="login" variant={theme}>
                  {navCTA.text}
                </Button>
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

                <Button href={navCTA.url} id="login" variant={'light'}>
                  {navCTA.text}
                </Button>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </section>
  );
}

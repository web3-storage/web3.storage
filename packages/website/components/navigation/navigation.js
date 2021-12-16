// ===================================================================== Imports
import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import clsx from 'clsx';
import Link from 'next/link';

import { useResizeObserver } from '../../hooks/resize-observer';
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
  const containerRef = useRef(null);
  // component State
  const [isSmallVariant, setSmallVariant] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);
  // Navigation Content
  const navItems = GeneralPageData.navigation;
  const logoText = GeneralPageData.site_logo.text;
  const theme = router.route === '/pricing' ? 'light' : 'dark';

  // ================================================================= Functions
  useResizeObserver(containerRef, () => {
    const shouldGoToSmallVariant = window.innerWidth < 640;
    if (shouldGoToSmallVariant && !isSmallVariant) {
      setSmallVariant(true);
    }
    if (!shouldGoToSmallVariant && isSmallVariant) {
      setSmallVariant(false);
    }
  });

  const toggleMenu = () => {
    // isMenuOpen ? document.body.classList.remove('overflow-hidden') : document.body.classList.add('overflow-hidden')
    setMenuOpen(!isMenuOpen);
  };

  // const queryClient = useQueryClient()

  const onLinkClick = useCallback(event => {
    console.log('clicked');
    // countly.trackCustomLinkClick(countly.events.LINK_CLICK_NAVBAR, event.currentTarget);
  }, []);

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
  //     small={isSmallVariant}
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
  //     small={isSmallVariant}
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
  //   <Button href="#" id="loading-user" small={isSmallVariant}>
  //     <Loading size={SpinnerSize.SMALL} />
  //   </Button>
  // );

  // ================================================ Main Template [Navigation]
  return (
    <section id="section_navigation" className="section-navigation">
      <div className="grid-noGutter">
        <div className="col">
          <nav id="navigation" ref={containerRef}>
            <div className="nav-bar">
              {isSmallVariant && (
                <div className="menu-toggle">
                  <button onClick={toggleMenu}>
                    <Hamburger aria-label="Toggle Navbar" />
                  </button>
                </div>
              )}

              <div className="site-logo-container">
                <a href="/" title={logoText} className="anchor-wrapper" onClick={onLinkClick}>
                  <SiteLogo className="site-logo-image" />
                  <div className="site-logo-text">{logoText}</div>
                </a>
              </div>

              <div className="nav-items-wrapper">
                {navItems.map(item => (
                  <Link href={item.url} key={item.text} className="nav-item" onClick={onLinkClick}>
                    {item.text}
                  </Link>
                ))}
                <Button href="/login" id="login" variant={theme} small={isSmallVariant}>
                  SIGN IN
                </Button>
              </div>
            </div>

            <div className={clsx('mobile-panel', isMenuOpen ? 'open' : '')} aria-hidden={isSmallVariant && isMenuOpen}>
              <div>
                <a href="/" title={logoText} onClick={onLinkClick}>
                  <SiteLogo />
                </a>

                {navItems.map(item => (
                  <Link href={item.url} key={item.text} className="nav-item" onClick={() => toggleMenu()}>
                    {item.text}
                  </Link>
                ))}

                <button className="exit-button" onClick={() => toggleMenu()}>
                  exit
                </button>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </section>
  );
}

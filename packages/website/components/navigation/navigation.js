// ===================================================================== Imports
import { useCallback, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import clsx from 'clsx';
import Link from 'next/link';

import { useAuthorization } from 'components/contexts/authorizationContext';
import ZeroAccordion from 'ZeroComponents/accordion/accordion';
// @ts-ignore
import ZeroAccordionSection from 'ZeroComponents/accordion/accordionSection';
import { useAuthorization } from 'components/contexts/authorizationContext';
import Button from '../button/button';
import SiteLogo from '../../assets/icons/w3storage-logo.js';
import Hamburger from '../../assets/icons/hamburger.js';
import GeneralPageData from '../../content/pages/general.json';
import { trackCustomLinkClick, events, ui } from 'lib/countly';
import Loading from 'components/loading/loading';
import Breadcrumbs from 'components/breadcrumbs/breadcrumbs';
import emailContent from '../../content/file-a-request';

// ====================================================================== Params
/**
 * Navbar Component
 *
 * @param {Object} props
 * @param {Boolean} props.isProductApp
 */

// ===================================================================== Exports
export default function Navigation({ isProductApp }) {
  const router = useRouter();
  const { isLoggedIn, isLoading, isFetching, logout } = useAuthorization();
  const isLoadingUser = useMemo(() => isLoading || isFetching, [isLoading, isFetching]);
  // component State
  const [isMenuOpen, setMenuOpen] = useState(false);
  // Navigation Content
  const links = GeneralPageData.navigation.links;
  const account = links.find(item => item.text.toLowerCase() === 'account');
  const navItems = links.filter(item => item.text.toLowerCase() !== 'account');
  const auth = GeneralPageData.navigation.auth;
  const logoText = GeneralPageData.site_logo.text;
  const theme = router.route === '/tiers' || isProductApp ? 'light' : 'dark';
  const buttonTheme = isProductApp ? 'pink-blue' : '';
  const mailTo = `mailto:${emailContent.mail}?subject=${emailContent.subject}&body=${encodeURIComponent(
    emailContent.body.join('\n')
  )}`;

  // ================================================================= Functions

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };

  const onLinkClick = useCallback(e => {
    trackCustomLinkClick(events.LINK_CLICK_NAVBAR, e.currentTarget);
    if (isMenuOpen) {
      setMenuOpen(false)
    }
  }, [isMenuOpen]);

  const login = useCallback(() => {
    router.push('/login');
    if (isMenuOpen) {
      setMenuOpen(false)
    }
  }, [router, isMenuOpen]);

  const handleKeySelect = useCallback(
    (e, url) => {
      onLinkClick(e);
      router.push(url);
    },
    [router, onLinkClick]
  );

  // ======================================================= Templates [Buttons]
  const getAccountMenu = () => {
    if (isProductApp) {
      const labelText = account.text.toLowerCase()
      return (
        <div className="nav-account-button">
          <button
            className={ clsx('nav-item', account.url === router.route ? 'current-page' : '')}
            onClick={onLinkClick}
            onKeyPress={e => handleKeySelect(e, account.url)}>
            {account.text}
          </button>
          <div className="nav-account-dropdown">
            <div className="label">{labelText[0].toUpperCase() + labelText.substring(1)}</div>
            {account.links.map(link => (
              <Link href={link.url === 'request-more-storage' ? mailTo : link.url} key={link.text}>
                <button className="nav-dropdown-link" onClick={onLinkClick} onKeyPress={e => handleKeySelect(e, link.url)}>
                  {link.text}
                </button>
              </Link>
            ))}
          </div>
        </div>
      )
    }
    return (
      <Link key={account.text} href={account.url}>
        <button
          className={ clsx('nav-item', account.url === router.route ? 'current-page' : '')}
          onClick={onLinkClick}
          onKeyPress={e => handleKeySelect(e, account.url)}>
          {account.text}
        </button>
      </Link>
    )
  }

  const logoutButton = (button, forceTheme) => {
    const variant = forceTheme || theme;
    return (
      <Button
        id="nav-auth-button"
        onClick={logout}
        variant={variant}
        tracking={{
          event: events.LOGOUT_CLICK,
          ui: ui.NAVBAR,
          action: 'Logout',
        }}
      >
        {button.text}
      </Button>
    );
  };

  const loginButton = (button, forceTheme) => {
    const variant = forceTheme || theme;
    return (
      <Button
        id="nav-auth-button"
        href={button.url}
        onClick={login}
        variant={variant}
        tracking={{
          ui: ui.NAVBAR,
          action: 'Login',
        }}
      >
        {button.text}
      </Button>
    );
  };

  const loadingButton = (button, forceTheme) => {
    const variant = forceTheme || theme;
    return (
      <Button href="#" id="nav-auth-button" variant={variant}>
        <span className="navigation-loader-text">{button.text}</span>
        <Loading className="navigation-loader" size="medium" color={variant === 'dark' ? 'white' : 'black'} />
      </Button>
    );
  };

  // ================================================ Main Template [Navigation]
  return (
    <section
      id="section_navigation"
      className={clsx('section-navigation', theme, isProductApp ? 'clear-bg' : '')}>
      <div className="grid-noGutter">
        <div className="col">
          <nav id="navigation">
            <div
              className={clsx(
                'nav-bar',
                isMenuOpen ? 'mobile-panel' : '',
                router.route === '/' || isProductApp ? 'breadcrumbs-hidden' : ''
              )}
            >
              <div className={clsx('site-logo-container', theme, isMenuOpen ? 'menu-open' : '')}>
                <Link href="/">
                  <div
                    title={logoText}
                    className="anchor-wrapper"
                    onClick={onLinkClick}
                    onKeyPress={e => handleKeySelect(e, '/')}
                    role="button"
                    tabIndex={0}
                  >
                    <SiteLogo className="site-logo-image" />
                    <button className="site-logo-text" onClick={onLinkClick} onKeyPress={e => handleKeySelect(e, '/')}>
                      {logoText}
                    </button>
                  </div>
                </Link>
              </div>

              <div className={clsx('nav-items-wrapper', theme)}>
                {navItems.map(item => (
                  <Link key={item.text} href={item.url}>
                    <button
                      className={ clsx('nav-item', item.url === router.route ? 'current-page' : '')}
                      onClick={onLinkClick}
                      onKeyPress={e => handleKeySelect(e, item.url)}>
                      {item.text}
                    </button>
                  </Link>
                ))}

                { isLoggedIn && getAccountMenu() }

                {isLoadingUser
                  ? loadingButton(auth.login, buttonTheme)
                  : isLoggedIn
                  ? logoutButton(auth.logout, buttonTheme)
                  : loginButton(auth.login, buttonTheme)}
              </div>

              <div className={clsx('nav-menu-toggle', theme, isMenuOpen ? 'menu-open' : '')}>
                <button onClick={toggleMenu}>
                  <Hamburger aria-label="Toggle Navbar" />
                </button>
              </div>
            </div>

            {router.route === '/' || isProductApp ? null : (
              <Breadcrumbs variant={theme} click={onLinkClick} keyboard={handleKeySelect} />
            )}

            <div className={clsx('nav-mobile-panel', isMenuOpen ? 'open' : '')} aria-hidden={isMenuOpen}>
              <div className="mobile-items-wrapper">

                {navItems.map((item, index) => (
                  <Link href={item.url} key={`mobile-${item.text}`}>
                    <button className="nav-item" onClick={onLinkClick} onKeyPress={onLinkClick}>
                      {item.text}
                    </button>
                  </Link>
                ))}

                { isLoggedIn &&
                  <ZeroAccordion multiple={false}>
                    <ZeroAccordionSection disabled={!Array.isArray(account.links)}>
                      <ZeroAccordionSection.Header>
                        <div className="nav-item-heading">
                          {account.text}
                        </div>
                      </ZeroAccordionSection.Header>

                      <ZeroAccordionSection.Content>
                        {Array.isArray(account.links) && (
                          <div className="nav-sublinks-wrapper">
                            {account.links.map(link => (
                              <Link
                                href={link.url === 'request-more-storage' ? mailTo : link.url}
                                key={link.text}>
                                <button
                                  className="nav-sublink"
                                  onClick={onLinkClick}
                                  onKeyPress={e => handleKeySelect(e, link.url)}
                                >
                                  {link.text}
                                </button>
                              </Link>
                            ))}
                          </div>
                        )}
                      </ZeroAccordionSection.Content>
                    </ZeroAccordionSection>
                  </ZeroAccordion>
                }

                {isLoadingUser
                  ? loadingButton(auth.login, 'light')
                  : isLoggedIn
                  ? logoutButton(auth.logout, 'light')
                  : loginButton(auth.login, 'light')}
              </div>
            </div>
          </nav>
        </div>
      </div>
    </section>
  );
}

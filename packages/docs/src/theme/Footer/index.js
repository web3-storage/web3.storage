import React from 'react'
import Squiggle from './squiggle.js'
import SiteLogo from './w3storage-logo.js'
import FooterData from './footer.json'

function Footer () {
  const contact = FooterData.footer.contact
  const resources = FooterData.footer.resources
  const getStarted = FooterData.footer.get_started
  const copyright = FooterData.footer.copyright

  return (
    <footer id='site-footer'>
      <section id='site-footer-section'>
        <Squiggle id='footer_squiggle' />

        <div className='grid'>
          <div className='col-4_sm-8_mi-12' data-push-left='off-1_sm-1_mi-0'>
            <div className='footer_contact'>
              <div className='footer_logo-container'>
                <SiteLogo />
                <div className='site-logo-text'>{contact.logo_text}</div>
              </div>
              <div className='prompt'>{contact.prompt}</div>
              {typeof contact.cta === 'object' && (
                <div className='button pink-blue cta Button'>
                  <button>
                    {contact.cta.text}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className='col-3_sm-5_mi-8' data-push-left='off-0_sm-2_mi-3'>
            <div className='footer_resources'>
              <div className='label'>{resources.heading}</div>
              {resources.items.map(item => (
                <a className='footer-link' href={item.url} key={item.text}>
                  {item.text}
                </a>
              ))}
            </div>
          </div>

          <div className='col-4_sm-5_mi-8' data-push-left='off-0_mi-3'>
            <div className='footer_get-started'>
              <div className='label'>{getStarted.heading}</div>
              {getStarted.items.map(item => (
                <a className='footer-link' href={item.url} key={item.text}>
                  {item.text}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div id='section_copyright' className='noGrid'>
          <div className='grid'>
            <div className='copyright_container'>
              <div className='copyright_left'>{copyright.left.text}</div>
              <div className='copyright_right'>
                {copyright.right.text}
                <a href={copyright.right.link.url} className='copyright_link'>
                  {copyright.right.link.text}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </footer>
  )
}

export default Footer

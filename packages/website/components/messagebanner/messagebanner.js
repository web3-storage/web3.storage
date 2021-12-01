// ===================================================================== Imports
import GeneralPageData from '../../content/pages/general.json';

// ===================================================================== Exports
export default function messageBanner() {
  const message = GeneralPageData.message_banner.text;
  const link = GeneralPageData.message_banner.link;
  return (
    <section id="section_message-banner">
      <div className="grid-noGutter">
        <div className="col">
          <div className="message-banner-container">
            <div className="message-banner-content">
              {message}
              <a href={link.url} className="message-banner-link">
                {link.text}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

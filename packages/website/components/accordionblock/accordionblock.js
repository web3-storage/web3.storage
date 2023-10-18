import ReactMarkdown from 'react-markdown';

import { ReactComponent as Chevron } from '../../assets/icons/chevron.svg';
import ZeroAccordion from 'ZeroComponents/accordion/accordion';
import ZeroAccordionSection from 'ZeroComponents/accordion/accordionSection';

/**
 * @param {Object} props.block
 */
export default function AccordionBlock({ block }) {
  return (
    <div className="block accordion-block">
      <ZeroAccordion multiple={block.multiple} toggleOnLoad={block.toggleOnLoad} toggleAllOption={true}>
        {block.sections.map((section, index) => (
          <ZeroAccordionSection key={`accordion_section-${index}`} slug={section.id} trackingId={section.heading}>
            <ZeroAccordionSection.Header>
              <div className="accordion-chevron">
                <Chevron />
              </div>
              <div className="accordion-header-text">{section.heading}</div>
            </ZeroAccordionSection.Header>
            <ZeroAccordionSection.Content>
              {block.markdown?.includes('content') ? (
                <ReactMarkdown>{section.content}</ReactMarkdown>
              ) : (
                <div className="accordion-content-text" dangerouslySetInnerHTML={{ __html: section.content }}></div>
              )}
            </ZeroAccordionSection.Content>
          </ZeroAccordionSection>
        ))}
      </ZeroAccordion>
    </div>
  );
}

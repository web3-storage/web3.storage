// ===================================================================== Imports
import ZeroAccordion from 'ZeroComponents/accordion/accordion';
import ZeroAccordionSection from 'ZeroComponents/accordion/accordionSection';
import { ReactComponent as Chevron } from '../../assets/icons/chevron.svg';

// ====================================================================== Params
/**
 * @param {Object} props.block
 */
// ====================================================================== Export
export default function AccordionBlock({ block }) {
  const multiple = block.multiple ? block.multiple : false;
  const toggleOnLoad = block.toggleOnLoad ? block.toggleOnLoad : false;
  return (
    <div className="block accordion-block">
      <ZeroAccordion multiple={multiple} toggleOnLoad={toggleOnLoad}>
        {block.sections.map((section, index) => (
          <ZeroAccordionSection key={`accordion_section-${index}`}>
            <ZeroAccordionSection.Header>
              <div className="accordion-chevron">
                <Chevron />
              </div>
              <div className="accordion-header-text">{section.heading}</div>
            </ZeroAccordionSection.Header>

            <ZeroAccordionSection.Content>
              <div className="accordion-content-text" dangerouslySetInnerHTML={{ __html: section.content }}></div>
            </ZeroAccordionSection.Content>
          </ZeroAccordionSection>
        ))}
      </ZeroAccordion>
    </div>
  );
}

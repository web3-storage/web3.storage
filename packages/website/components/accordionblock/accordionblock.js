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
  return (
    <div className="block accordion-block">
      <ZeroAccordion multiple={true} toggleOnLoad={true}>
        {block.sections.map((section, index) => (
          <ZeroAccordionSection key={`accordion_section-${index}`}>
            <ZeroAccordionSection.Header>
              <div className="accordion-chevron">
                <Chevron />
              </div>
              <div className="accordion-header-text">{section.heading}</div>
            </ZeroAccordionSection.Header>

            <ZeroAccordionSection.Content>
              <div>{section.content}</div>
            </ZeroAccordionSection.Content>
          </ZeroAccordionSection>
        ))}
      </ZeroAccordion>
    </div>
  );
}

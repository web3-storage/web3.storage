// ===================================================================== Imports
import ZeroAccordion from 'ZeroComponents/accordion/accordion';
import ZeroAccordionSection from 'ZeroComponents/accordion/accordionSection';

// ====================================================================== Params
/**
 * @param {Object} props.block
 */
// ====================================================================== Export
export default function AccordionBlock({ block }) {
  return (
    <div className="block accordion-block">
      <ZeroAccordion
        multiple={true} 
        sections={block.sections}>
        {block.sections.map((section, index) => (
          <ZeroAccordionSection
            key={`accordion_section-${index}`}>

            <ZeroAccordionSection.Header>
              <div>{ section.heading }</div>
            </ZeroAccordionSection.Header>

            <ZeroAccordionSection.Content>
              <div>{ section.content }</div>
            </ZeroAccordionSection.Content>

          </ZeroAccordionSection>
        ))}
      </ZeroAccordion>
    </div>
  );
}

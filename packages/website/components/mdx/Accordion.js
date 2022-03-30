import { ReactComponent as Chevron } from '../../assets/icons/chevron.svg';
import ZeroAccordion from 'ZeroComponents/accordion/accordion';
import ZeroAccordionSection from 'ZeroComponents/accordion/accordionSection';

/**
 * @param {Object} props.block
 */
export default function Accordion({ heading, children }) {
  return (
    <div className="block accordion-block">
      <ZeroAccordion multiple={false} toggleOnLoad={false} toggleAllOption={false}>
        <ZeroAccordionSection>
          <ZeroAccordionSection.Header>
            <div className="accordion-chevron">
              <Chevron />
            </div>
            <div className="accordion-header-text">{heading}</div>
          </ZeroAccordionSection.Header>
          <ZeroAccordionSection.Content>{children}</ZeroAccordionSection.Content>
        </ZeroAccordionSection>
      </ZeroAccordion>
    </div>
  );
}

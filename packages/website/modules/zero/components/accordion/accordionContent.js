// ===================================================================== Imports
import clsx from 'clsx';

// ====================================================================== Params
/**
 * @param function props.toggle
 */
// ====================================================================== Export
export default function AccordionContent({ children }) {

  // ================================================================= Functions

  // ==================================================================== Export
  return (
    <div class="accordion-content">

      {children ? children : ''}

    </div>
  );
}

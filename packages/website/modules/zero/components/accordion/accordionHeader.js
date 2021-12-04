// ===================================================================== Imports
import clsx from 'clsx';

// ====================================================================== Params
/**
 * @param function props.toggle
 */
// ====================================================================== Export
export default function AccordionHeader({ toggle, uid, children }) {

  // ================================================================= Functions
  // console.log(uid)
  // ==================================================================== Export
  return (
    <div
    class="accordion-header"
    onClick={ () => { toggle(uid) } }>

      {children ? children : ''}

    </div>
  );
}

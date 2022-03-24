// ===================================================================== Imports
import clsx from 'clsx';

// ====================================================================== Params
/**
 *
 * @callback props.toggle
 * @param String props.uid
 */
// ====================================================================== Export
export default function AccordionHeader({ toggle, uid, children }) {
  return (
    <div
      className="accordion-header"
      onClick={ () => { toggle(uid) } }>

      {children ? children : ''}

    </div>
  );
}

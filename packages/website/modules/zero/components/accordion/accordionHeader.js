/**
 *
 * @callback props.toggle
 * @param String props.uid
 */
export default function AccordionHeader({ toggle, uid, children }) {
  return (
    <div
      className="accordion-header"
      onClick={() => {
        toggle(uid);
      }}
    >
      {children || ''}
    </div>
  );
}

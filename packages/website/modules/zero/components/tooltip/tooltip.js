import clsx from 'clsx';
import { BsFillInfoCircleFill } from 'react-icons/bs';


/**
 * @typedef {Object} InfoProps
 * @property {string} content
 * @property {string} [position]
 * @property {React.ReactNode} [icon]
 * @property {string|React.ReactNode} [children]
 * @prop {string} [className]
 */

/**
 *
 * @param {InfoProps} props
 * @returns
 */
const Tooltip = ({ children, content, icon = null, className, position }) => {
  return (
    <div role="tooltip" className={clsx(className, 'Tooltip', position)}>
      {!children && (icon || <BsFillInfoCircleFill />)}
      {children}
      <span className="tooltip-content" dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
};

export default Tooltip;

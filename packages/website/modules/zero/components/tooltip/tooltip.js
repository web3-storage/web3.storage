import clsx from 'clsx';
import { useCallback, useEffect } from 'react';
import InfoAIcon from 'assets/icons/infoA';

/**
 * @typedef {Object} InfoProps
 * @property {string} content
 * @property {React.ReactNode} [icon]
 * @prop {string} [className]
 */

/**
 *
 * @param {InfoProps} props
 * @returns
 */
const Tooltip = ({ content, icon = null, className }) => (
  <div className={clsx(className, 'Tooltip')}>
    {icon || <InfoAIcon />}
    <span className="info-tooltip" dangerouslySetInnerHTML={{ __html: content }} />
  </div>
);

export default Tooltip;

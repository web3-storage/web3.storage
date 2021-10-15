import RCTooltip from 'rc-tooltip'
import 'rc-tooltip/assets/bootstrap_white.css'

/**
 * @param {Object} props
 * @param {JSX.Element} props.children
 * @param {JSX.Element} props.overlay
 * @param {string} [props.placement]
 * @param {boolean} [props.destroyTooltipOnHide]
 * @param {string} [props.overlayClassName]
 */
const Tooltip = ({ children, placement = 'top', overlay, destroyTooltipOnHide, overlayClassName = '' }) => (
    <RCTooltip placement={placement} overlay={
        <div className="bg-white rounded p-2 text-xs inline-flex text-w3storage-purple">{ overlay }</div>
    } overlayInnerStyle={{ borderColor: '#fc6553' }} destroyTooltipOnHide={destroyTooltipOnHide} overlayClassName={overlayClassName}>
        {children}
    </RCTooltip>
)
  
export default Tooltip
  
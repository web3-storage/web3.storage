import SpinnerIcon from '../icons/spinner'

/**
 * @param {Object} [props]
 * @param {string} [props.className]
 * @param {Number} [props.height]
 * @param {string} [props.fill]
 */
const Loading = ({ className, height = 50, fill='#000' }) => (
  <div className={ className || 'loading' }>
    <SpinnerIcon src="/spinner.svg" height={height} aria-label="Loading" fill={fill} />
  </div>
)

export default Loading

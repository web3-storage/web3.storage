import { ReactComponent as SpinnerIcon } from 'Icons/spinner.svg'
import clsx from 'clsx'

import styles from './loading.module.scss';

export const SpinnerSize = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large'
}

export const SpinnerColor = {
  WHITE: 'white',
  BLACK: 'black',
}

/**
 * @param {Object} [props]
 * @param {string} [props.className]
 * @param {SpinnerSize} [props.size]
 * @param {SpinnerColor} [props.color]
 */
const Loading = ({ className, size, color }) => (
  <div className={ clsx(className, styles.loading) }>
    <SpinnerIcon aria-label="Loading" className={clsx(styles[`spinner-${size}`], styles[`spinner-${color}`])} />
  </div>
)

Loading.defaultProps = {
  size: SpinnerSize.SMALL,
  color: SpinnerColor.WHITE
}

export default Loading

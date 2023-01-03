import clsx from 'clsx';

import SpinnerIcon from 'assets/icons/spinner';
import styles from './loading.module.scss';

export const SpinnerSize = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
};

export const SpinnerColor = {
  WHITE: 'white',
  BLACK: 'black',
  GRADIENT: 'gradient',
};

/**
 * @param {Object} props
 * @param {string} [props.className]
 * @param {string} [props.size]
 * @param {string} [props.color]
 * @param {string} [props.message]
 */
const Loading = ({ className, size, color, message }) => (
  <div
    className={clsx(className, {
      [styles.loading]: true,
      [styles.message]: message,
    })}
  >
    <SpinnerIcon aria-label="Loading" className={clsx(styles[`spinner-${size}`], styles[`spinner-${color}`])} />
    {message}
  </div>
);

Loading.defaultProps = {
  className: '',
  size: SpinnerSize.LARGE,
  color: SpinnerColor.GRADIENT,
};

export default Loading;

import Link from 'next/link'
import clsx from 'clsx'

import styles from './button.module.scss';

/**
 * @typedef {Object} ButtonProps
 * @prop {string} [wrapperClassName]
 * @prop {string} [className]
 * @prop { import('react').MouseEventHandler<HTMLButtonElement> } [onClick]
 * @prop {string} [href]
 * @prop {import('react').ButtonHTMLAttributes<HTMLButtonElement>["type"]} [type]
 * @prop {import('react').ReactNode | string} children
 * @prop {boolean} [disabled]
 * @prop {string} [id]
 * @prop {'dark' | 'light' | 'outlined' } [variant]
 * @prop {boolean} [small] If the button should have min-width & height or not
 * @prop {import('react').FunctionComponent} [Icon] Icon component to prefixclick
 */

/**
 *
 * @param {ButtonProps} param0
 * @returns
 */
const Button = ({
  id,
  wrapperClassName,
  className,
  onClick,
  href,
  type,
  children,
  disabled,
  variant,
  small,
  Icon
}) => {
  const btn = (
    <div className={wrapperClassName}>
      <button
        type={type}
        className={clsx(className, styles.button, styles[variant || 'default'], { [styles.small]: !small })}
        onClick={onClick}
        disabled={disabled}
        id={id}
      >
        { Icon && <Icon className="w-7 mr-2 fill-current"/> }
        {children}
      </button>
    </div>
  )
  return href 
    ? <Link href={href}>
        {btn}
      </Link> 
    : btn
}

Button.defaultProps = {
  type: 'button',
  disabled: false,
}

export default Button

import Link from 'next/link'
import clsx from 'clsx'

/**
 * @typedef {Object} ButtonProps
 * @prop {string} [className]
 * @prop { import('react').MouseEventHandler<HTMLButtonElement> } [onClick]
 * @prop {string} [href]
 * @prop {import('react').ButtonHTMLAttributes<HTMLButtonElement>["type"]} [type]
 * @prop {boolean} [disabled]
 * @prop {boolean} [openInNewWindow]
 * @prop {import('react').ReactNode | string} children
 */

const Button = ({
  className,
  onClick,
  href,
  type,
  disabled,
  openInNewWindow,
  children
}) => {

  return (
    <div className={clsx(className, 'Button')}>
      { href
        ? (
          openInNewWindow
          ?
            <a href={href} target="_blank">{children}</a>
          :
            <Link href={href}>{children}</Link>
        )
        :
          <button type={type} onClick={onClick} disabled={disabled}>{children}</button>
      }
    </div>
  )
}

Button.defaultProps = {
  type: "button",
  openInNewWindow: false,
  disabled: false,
}

export default Button

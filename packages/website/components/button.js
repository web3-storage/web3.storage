import Link from 'next/link'
import clsx from 'clsx'

/**
 * @typedef {Object} ButtonProps
 * @prop {string} [wrapperClassName]
 * @prop {string} [className]
 * @prop { import('react').MouseEventHandler<HTMLButtonElement> } [onClick]
 * @prop {string} [href]
 * @prop {import('react').ButtonHTMLAttributes<HTMLButtonElement>["type"]} [type]
 * @prop {import('react').ReactChildren | string} children
 * @prop {boolean} [disabled]
 * @prop {string} [id]
 * @prop {'dark' | 'light'} [variant]
 */

/**
 *
 * @param {ButtonProps} param0
 * @returns
 */
export default function Button({
  id,
  wrapperClassName,
  className,
  onClick,
  href,
  type = 'button',
  children,
  disabled = false,
  variant = 'dark'
}) {
  const buttonStyle = { minWidth: '8rem', minHeight: '3.25rem' }
  const variantClasses = variant === 'dark' ? 'bg-black text-white' : 'bg-transparent text-black'

  const btn = (
    <button
      type={type}
      className={clsx(
        variantClasses,
        'w-full',
        'border',
        'border-black',
        'rounded-md',
        'px-4',
        { pointer: !disabled },
        'typography-cta',
        className
      )}
      style={buttonStyle}
      onClick={onClick}
      disabled={disabled}
      id={id}
    >
      {children}
    </button>
  )
  return href ? (
    <Link href={href}>
      <a className={wrapperClassName}>
        {btn}
      </a>
    </Link>
  ) : (
    <div className={wrapperClassName}>
      {btn}
    </div>
  )
}

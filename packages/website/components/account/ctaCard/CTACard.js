import clsx from 'clsx';

import Button from 'components/button/button';

export const CTAThemeType = {
  LIGHT: 'light',
  DARK: 'dark',
};

/**
 * @typedef {Object} CTACardProps
 * @property {string} [className] - optional
 * @property {any} [ctas]
 * @property {string} [heading]
 * @property {string} [description]
 * @property {any} [theme]
 * @property {import('react').ReactNode | string} [background] - optional
 */

/**
 *
 * @param {CTACardProps} props
 * @returns
 */
const CTACard = ({ className = '', heading, description, ctas, theme = CTAThemeType.LIGHT, background }) => {
  return (
    <div className={clsx('section cta-card', className, `cta-card__${theme}`)}>
      {background}
      <h4>{heading}</h4>
      <span>{description}</span>
      {!!ctas?.length && (
        <div className="cta-buttons-container">
          {ctas.map(({ onClick = () => null, children: text, ...buttonProps }) => (
            <Button key={text} onClick={onClick} {...buttonProps}>
              {text}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CTACard;

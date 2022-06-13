import clsx from 'clsx';

import Button, { ButtonVariant } from 'components/button/button';
import Tooltip from 'ZeroComponents/tooltip/tooltip';

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
      <div className="cta-card__background">{background}</div>
      <h3 className="cta-card-heading">{heading}</h3>
      <span>{description}</span>
      {!!ctas?.length && (
        <div className="cta-buttons-container">
          {ctas.map(({ onClick = () => null, children: text, ...buttonProps }) => {
            const btn = (
              <Button
                href={buttonProps.href}
                key={buttonProps.href || text}
                onClick={onClick}
                {...buttonProps}
                variant={buttonProps.disabled ? ButtonVariant.GRAY : buttonProps.variant}
              >
                {text}
              </Button>
            );

            if (buttonProps.tooltip) {
              return <Tooltip content={buttonProps.tooltip}>{btn}</Tooltip>;
            }

            return btn;
          })}
        </div>
      )}
    </div>
  );
};

export default CTACard;

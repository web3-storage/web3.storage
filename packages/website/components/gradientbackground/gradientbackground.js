// ===================================================================== Imports
import clsx from 'clsx';

import { GradientImage } from '../../assets/illustrations/gradient-background.js';
// ====================================================================== Params
/**
 * @param {Object} props
 * @param {string} props.variant
 */
// ====================================================================== Export
export default function GradientBackground({ variant = 'saturated' }) {
  const getBackgroundImageType = type => {
    switch (type) {
      case 'mobile':
        return <GradientImage className="mobile-variant" />;
      case 'light':
        return <GradientImage className="light-variant" />;
      case 'header':
        return <GradientImage className="header-variant" />;
      default:
        return <GradientImage className="saturated-variant" />;
    }
  };

  return <div className={clsx("gradient-background-component", variant)}>{getBackgroundImageType(variant)}</div>;
}

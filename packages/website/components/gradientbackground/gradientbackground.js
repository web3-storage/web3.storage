// ===================================================================== Imports
import clsx from 'clsx';

import { GradientA } from '../../assets/illustrations/gradient-background.js';
import { GradientB } from '../../assets/illustrations/gradient-background.js';
import { GradientC } from '../../assets/illustrations/gradient-background.js';
import { GradientD } from '../../assets/illustrations/gradient-background.js';
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
        return <GradientD className="mobile-variant" />;
      case 'light':
        return <GradientC className="light-variant" />;
      case 'header':
        return <GradientA className="header-variant" />;
      default:
        return <GradientB className="saturated-variant" />;
    }
  };

  return <div className={clsx("gradient-background-component", variant)}>{getBackgroundImageType(variant)}</div>;
}

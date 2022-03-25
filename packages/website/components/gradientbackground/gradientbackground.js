// ===================================================================== Imports
import clsx from 'clsx';

import GradientBackgroundA from '../../assets/illustrations/gradient-background-a.js';
import GradientBackgroundC from '../../assets/illustrations/gradient-background-c.js';
import GradientBackgroundD from '../../assets/illustrations/gradient-background-d.js';
// ====================================================================== Params
/**
 * @param {Object} props
 * @param {string} props.variant
 * @param {string} props.classlist
 */
// ====================================================================== Export
export default function GradientBackground({ variant = 'saturated', classlist }) {
  const getBackgroundImageType = type => {
    switch (type) {
      case 'mobile':
        return <GradientBackgroundD className="gradient-background-image-cover" />;
      case 'light':
        return <GradientBackgroundC className="gradient-background-image-cover" />;
      default:
        return <GradientBackgroundA className="gradient-background-image-cover" />;
    }
  };

  return <div className={clsx('gradient-background-component', classlist)}>{getBackgroundImageType(variant)}</div>;
}

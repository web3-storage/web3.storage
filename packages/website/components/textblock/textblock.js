// ===================================================================== Imports
import clsx from 'clsx';

import Button from '../button/button';
import countly from '../../lib/countly';

// ====================================================================== Params
/**
 * @param {Object} props.block
 * @param {Object} props.className
 */
// ====================================================================== Export
export default function TextBlock({ block, className }) {
  // Object.assign(styles, className);
  const format = block.format || 'medium';
  const hasDescription = typeof block.description === 'string' || Array.isArray(block.description);
  const ui = typeof block.cta !== 'object' ? '' : block.cta.hasOwnProperty('tracking') ? block.cta.tracking : '';
  const action = typeof block.cta !== 'object' ? '' : block.cta.hasOwnProperty('action') ? block.cta.action : '';
  const tracking = {
    ui: countly.ui[ui],
    action: action,
  };
  // ================================================================= Functions
  const formatDescription = text => {
    if (Array.isArray(text)) {
      return (
        <>
          {text.map(item => (
            <p key={item} dangerouslySetInnerHTML={{ __html: item }}></p>
          ))}
        </>
      );
    }
    return text;
  };

  const getHeadingType = block => {
    switch (block.format) {
      case 'header':
        return <h1 className={clsx('h1', 'heading')}>{block.heading}</h1>;
      case 'small':
        return <h3 className={clsx('h3', 'heading')}>{block.heading}</h3>;
      default:
        return <h2 className={clsx('h2', 'heading')}>{block.heading}</h2>;
    }
  };
  // ==================================================================== Export
  return (
    <div className={clsx('block text-block', `format__${format}`)}>
      {typeof block.label === 'string' && (
        <div className={'label'}>
          <span className={clsx('label-text')}>{block.label}</span>
        </div>
      )}

      {typeof block.heading === 'string' && getHeadingType(block)}

      {typeof block.subheading === 'string' && (
        <div className={'subheading'} dangerouslySetInnerHTML={{ __html: block.subheading }}></div>
      )}

      {hasDescription && <div className={'description'}>{formatDescription(block.description)}</div>}

      {typeof block.cta === 'object' && (
        <div className={'cta'}>
          <Button href={block.cta.url} variant={block.cta.theme} tracking={tracking}>
            {block.cta.text}
          </Button>
        </div>
      )}
    </div>
  );
}

// ===================================================================== Imports
import { useCallback } from 'react';
import { useRouter } from 'next/router';
import clsx from 'clsx';

import Button from '../button/button';
import analytics from '../../lib/analytics';

// ====================================================================== Params
/**
 * @param {Object} block
 */
// ====================================================================== Export
export default function TextBlock({ block }) {
  const router = useRouter();
  const format = block.format || 'medium';
  const hasDescription = typeof block.description === 'string' || Array.isArray(block.description);
  const tracking = {};
  const tracking2 = {};
  if (typeof block.cta === 'object') {
    if (block.cta.event) {
      tracking.event = analytics.events[block.cta.event];
    }
    if (block.cta.ui) {
      tracking.ui = analytics.ui[block.cta.ui];
    }
    if (block.cta.action) {
      tracking.action = block.cta.action;
    }
  }
  if (typeof block.cta22 === 'object') {
    if (block.cta2.event) {
      tracking2.event = analytics.events[block.cta2.event];
    }
    if (block.cta2.ui) {
      tracking2.ui = analytics.ui[block.cta2.ui];
    }
    if (block.cta2.action) {
      tracking2.action = block.cta2.action;
    }
  }

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

  const handleButtonClick = useCallback(
    cta => {
      if (cta.url) {
        router.push(cta.url);
      }
    },
    [router]
  );

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
        <Button
          className={'cta'}
          variant={block.cta.theme}
          tracking={tracking}
          onClick={() => handleButtonClick(block.cta)}
          onKeyPress={() => handleButtonClick(block.cta)}
        >
          {block.cta.text}
        </Button>
      )}
      {typeof block.cta2 === 'object' && (
        <Button
          className={'cta cta2'}
          variant={block.cta2.theme}
          tracking={tracking2}
          onClick={() => handleButtonClick(block.cta2)}
          onKeyPress={() => handleButtonClick(block.cta2)}
        >
          {block.cta2.text}
        </Button>
      )}
    </div>
  );
}

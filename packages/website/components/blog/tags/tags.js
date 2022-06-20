import clsx from 'clsx';
import React from 'react';

import Button, { ButtonVariant } from '../../button/button';

/**
 * Tag Component
 *
 * @param {Object} props
 * @returns {JSX.Element}
 */
export const Tag = ({ tag }) => {
  const isString = typeof tag === 'string';
  const inner = <span>{isString ? tag : tag.label}</span>;
  return isString ? (
    inner
  ) : (
    <Button variant={ButtonVariant.TEXT} onClick={tag.onClick} className={clsx(tag.selected && 'active')}>
      {tag.label}
    </Button>
  );
};

/**
 * Tags Component
 *
 * @param {Object} props
 * @returns {JSX.Element}
 */
const Tags = ({ tags, comma }) => (
  <div className="tags-container">{tags.map((tag, i) => [comma ? i > 0 && ', ' : '', <Tag key={i} tag={tag} />])}</div>
);

export default Tags;

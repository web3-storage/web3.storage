import clsx from 'clsx';
import React from 'react';

import Button, { ButtonVariant } from '../../components/button/button';

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
const Tags = ({ tags }) => (
  <div className={clsx('tags-container', typeof tags[0] !== 'string' && 'blog-tags-buttons')}>
    {tags.map(tag => (
      <React.Fragment key={`blog-tag-${tag}`}>
        <Tag tag={tag} />
      </React.Fragment>
    ))}
  </div>
);

export default Tags;

import clsx from 'clsx';
import Link from 'next/link';
import React from 'react';

import Button, { ButtonVariant } from '../../button/button';

/**
 * Helper utility method that converts tags to/from string/array
 *
 * @param {string|Array<string>} tags
 * @returns string|Array<string>
 */
export const convertSluggableTags = tags =>
  Array.isArray(tags)
    ? tags.map(tag => tag.split(' ').join('-')).join(',')
    : tags.split(',').map(tag => tag.split('-').join(' '));
/**
 * Tag Component
 *
 * @param {Object} props
 * @returns {JSX.Element}
 */
export const Tag = ({ tag, isLink }) => {
  const isString = typeof tag === 'string';
  const inner = <span>{isString ? tag : tag.label}</span>;
  return isString ? (
    isLink ? (
      <Link href={isLink && `/blog?tags=${convertSluggableTags([tag.toLowerCase()])}`} passHref>
        {tag}
      </Link>
    ) : (
      inner
    )
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
const Tags = ({ tags, comma, isLinks }) => (
  <div className="tags-container">
    {tags.map((tag, i) => [comma ? i > 0 && ', ' : '', <Tag key={i} tag={tag} isLink={isLinks} />])}
  </div>
);

export default Tags;

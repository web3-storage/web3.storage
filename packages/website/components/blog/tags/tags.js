import clsx from 'clsx';
import Link from 'next/link';
import React from 'react';

import Button, { ButtonVariant } from '../../button/button';

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
      <Link href={isLink && `/blog?tags=${JSON.stringify([tag.toLowerCase()])}`} passHref>
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

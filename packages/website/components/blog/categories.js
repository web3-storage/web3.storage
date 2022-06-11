import clsx from 'clsx';
import React from 'react';

import Button, { ButtonVariant } from '../../components/button/button';

/**
 * Category Component
 *
 * @param {Object} props
 * @returns {JSX.Element}
 */
export const Category = ({ category }) => {
  const isString = typeof category === 'string';
  const inner = <span>{isString ? category : category.label}</span>;
  return isString ? (
    inner
  ) : (
    <Button
      variant={ButtonVariant.OUTLINE_DARK}
      onClick={category.onClick}
      className={clsx(category.selected && 'active')}
    >
      {category.label}
    </Button>
  );
};

/**
 * Categories Component
 *
 * @param {Object} props
 * @returns {JSX.Element}
 */
const Categories = ({ categories }) => (
  <div className={clsx('categories-container', typeof categories[0] !== 'string' && 'blog-categories-buttons')}>
    {categories.map((category, index, row) => (
      <React.Fragment key={`blog-category-${category}-${index}`}>
        <Category category={category} />
      </React.Fragment>
    ))}
  </div>
);

export default Categories;

import clsx from 'clsx';

import Button from 'ZeroComponents/button/button';

/**
 * Tag Component
 *
 * @param {Object} props
 * @returns {JSX.Element}
 */
export const Tag = ({ tag }) => {
  const isString = typeof tag === 'string';
  const inner = (
    <span className={clsx('ph2 pv1 f6 ba ttc mr1 mb1', isString && 'select-none')}>{isString ? tag : tag.label}</span>
  );
  return isString ? (
    inner
  ) : (
    <div>
      <Button onClick={tag.onClick} className={clsx('btn-secondary ttc items-center', tag.selected && 'active')}>
        {tag.label}
      </Button>
    </div>
  );
};

/**
 * Tags Component
 *
 * @param {Object} props
 * @returns {JSX.Element}
 */
const Tags = ({ tags }) => (
  <div className={clsx('blog-tags', typeof tags[0] !== 'string' && 'blog-tags-buttons')}>
    {tags.map((tag, index) => (
      <Tag tag={tag} key={`blog-tag-${tag}-${index}`} />
    ))}
  </div>
);

export default Tags;

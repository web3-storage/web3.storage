import clsx from 'clsx';

import Button, { ButtonVariant } from '../../components/button/button';

/**
 * Tag Component
 *
 * @param {Object} props
 * @returns {JSX.Element}
 */
export const Tag = ({ tag }) => {
  const isString = typeof tag === 'string';
  const inner = <span className={clsx(isString && 'select-none')}>{isString ? tag : tag.label}</span>;
  return isString ? (
    inner
  ) : (
    <Button variant={ButtonVariant.OUTLINE_DARK} onClick={tag.onClick} className={clsx(tag.selected && 'active')}>
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
  <div className={clsx(typeof tags[0] !== 'string' && 'blog-tags-buttons')}>
    {tags.map((tag, index) => (
      <Tag tag={tag} key={`blog-tag-${tag}-${index}`} />
    ))}
  </div>
);

export default Tags;

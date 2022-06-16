import fs from 'fs';

import { useCallback, useMemo, useState, useEffect } from 'react';
import clsx from 'clsx';
import matter from 'gray-matter';
import { uniq } from 'lodash';

import CloseIcon from 'assets/icons/close';
import useQueryParams from 'ZeroHooks/useQueryParams';
import Modal from 'ZeroComponents/modal/modal';
import Pagination from 'ZeroComponents/pagination/pagination';
import BlogPageData from '../../content/pages/blog.json';
import BlockBuilder from '../../components/blockbuilder/blockbuilder.js';
import { initFloaterAnimations } from '../../lib/floater-animations.js';
import Button, { ButtonVariant } from '../../components/button/button';
import Tags from '../../components/blog/tags';
import Categories from '../../components/blog/categories';
import { Card } from '../../components/blog/cards';

const BLOG_ITEMS_PER_PAGE = 4;

/**
 * Blog Cards
 * @param {Object} props
 */
const Items = ({ currentItems }) => (
  <>
    {currentItems.map((post, i) => (
      <Card key={i} post={post} />
    ))}
  </>
);

export async function getStaticProps() {
  const files = fs.readdirSync('posts');

  let featuredImage = null;

  /**
   * @param {string} date
   */

  files.sort().reverse();

  const posts = files
    ? files
        .filter(filename => !filename.startsWith('.'))
        .map((fn, index) => {
          const content = fs.readFileSync(`posts/${fn}`).toString();
          const info = matter(content);
          if (index === 0) featuredImage = info.data.thumbnail;
          return {
            ...info.data,
            slug: fn.split('.')[0],
          };
        })
    : [];

  return {
    props: {
      posts,
      title: 'Blog - Web3.Storage',
      image: featuredImage,
    },
  };
}

/**
 * Pagination Component
 *
 * @param {Object} props
 * @param {Object} props.items
 * @param {string[]} [props.selectedCategory]
 * @returns {JSX.Element}
 */
const Paginated = ({ items }) => {
  const [paginatedFiles, setPaginatedFiles] = useState(items);

  return (
    <div className="blog-list-container">
      {paginatedFiles.length > 0 ? <Items currentItems={paginatedFiles} /> : <div>More blogs coming soon</div>}
      {items.length > BLOG_ITEMS_PER_PAGE && (
        <div className="blog-pagination">
          <Pagination
            className="files-manager-pagination"
            items={items}
            itemsPerPage={BLOG_ITEMS_PER_PAGE}
            visiblePages={1}
            queryParam="page"
            onChange={setPaginatedFiles}
          />
        </div>
      )}
    </div>
  );
};

/**
 *
 * @param {Object} props
 * @param {string[]} props.categories
 * @param {string} props.selectedCategory
 * @param {(tag: string) => void} props.handleCategoryClick
 * @returns {JSX.Element}
 */
function CategoryContainer({ categories, selectedCategory, handleCategoryClick }) {
  return (
    <Categories
      categories={categories.map(category => {
        const normCategory = category.toLowerCase();
        return {
          label: category,
          onClick: () => handleCategoryClick(normCategory),
          selected: (normCategory === 'all' && !selectedCategory) || selectedCategory === normCategory,
        };
      })}
    />
  );
}

/**
 * Blog Page
 * @param {Object} props
 */
const Blog = ({ posts = [] }) => {
  const [category, setCategory] = useQueryParams('category');
  const [keyword, setKeyword] = useQueryParams('keyword');
  const [tagsRaw, setTags] = useQueryParams('tags');
  const tagsModalOpenState = useState(false);
  const tags = useMemo(() => (!!tagsRaw ? JSON.parse(tagsRaw) : []), [tagsRaw]);
  const categories = useMemo(() => ['All', ...uniq(posts.map(({ category }) => category)).sort()], [posts]);
  const sections = BlogPageData.page_content;
  const animations = BlogPageData.floater_animations;

  useEffect(() => {
    let pageFloaters = {};
    initFloaterAnimations(animations).then(result => {
      pageFloaters = result;
    });
    return () => {
      if (pageFloaters.hasOwnProperty('destroy')) {
        pageFloaters.destroy();
      }
    };
  }, [animations]);

  // Almagamating all tags available across all posts
  const allTags = useMemo(
    () =>
      uniq(posts.map(({ tags }) => tags).flat())
        .sort()
        .map(tag => {
          const normCategory = tag.toLowerCase();
          return {
            label: tag,
            onClick: () => {
              if (normCategory === 'all') {
                return setTags('');
              }
              if (tags.includes(normCategory)) {
                tags.splice(tags.indexOf(normCategory), 1);
              } else {
                tags.push(normCategory);
              }
              return setTags(!!tags.length ? JSON.stringify(tags) : '');
            },
            selected: (normCategory === 'all' && !tags.length) || tags.includes(normCategory),
          };
        }),
    [posts, tags, setTags]
  );

  const filteredPosts = useMemo(
    () =>
      posts.filter(
        ({ tags: postTags, category: postCategory, title: postTitle, description: postDescription }) =>
          // Filter by tags
          (!tags || tags.every(tag => postTags.map(postTag => postTag.toLowerCase()).includes(tag))) &&
          // Filter by category
          (!category || postCategory.toLowerCase() === category) &&
          // Filter by title
          (!keyword || [postTitle, postDescription].some(item => item.toLowerCase().indexOf(keyword) >= 0))
      ),
    [posts, category, keyword, tags]
  );

  /**
   *
   * @param {string} category
   */
  const handleCategoryClick = useCallback(
    category => {
      setCategory(category === 'all' ? '' : category);
    },
    [setCategory]
  );

  /**
   *
   * @param {string} category
   */
  const onSearch = useCallback(
    event => {
      setKeyword(event.currentTarget.value.toLowerCase() || '');
    },
    [setKeyword]
  );

  /**
   *
   * @param {string} category
   */
  const onRemoveTag = useCallback(
    tag => () => {
      tags.splice(tags.indexOf(tag), 1);
      setTags(JSON.stringify(tags));
    },
    [setTags, tags]
  );

  /**
   * @param {Object} props
   * @param {JSX.Element | string} props.children
   */
  const Backdrop = ({ children }) => <div className={clsx('grid')}>{children}</div>;

  if (posts.length === 0) return <Backdrop>There are no blogs yet 😞</Backdrop>;

  return (
    <main className="grid blog-index">
      {sections.map((section, index) => (
        <BlockBuilder id={`blog_section_${index + 1}`} key={`section_${index}`} subsections={section} />
      ))}
      <Button variant={ButtonVariant.DARK} href="/blog/subscribe">
        Subscribe
      </Button>
      <div className="blog-search-c">
        <div>
          <div className="blog-search-input">
            <input placeholder="Search" defaultValue={keyword} type="text" onChange={onSearch} />
          </div>
          {tags.map(tag => (
            <div key={tag}>
              {allTags.find(({ label }) => label.toLowerCase() === tag)?.label}
              <Button variant={ButtonVariant.TEXT} onClick={onRemoveTag(tag)}>
                X
              </Button>
            </div>
          ))}
          <Button className="blue" variant={ButtonVariant.TEXT} onClick={() => tagsModalOpenState[1](true)}>
            More Tags
          </Button>
        </div>
        <CategoryContainer
          selectedCategory={category}
          handleCategoryClick={handleCategoryClick}
          categories={categories}
        />
      </div>
      <Paginated items={filteredPosts} />
      <Modal
        className="blog-tags-modal"
        animation="don"
        modalState={tagsModalOpenState}
        closeIcon={<CloseIcon />}
        showCloseButton
      >
        <div className="blog-tags-modal-inner">
          <h5>All Tags</h5>
          <Tags tags={allTags} comma={false} />
        </div>
      </Modal>
    </main>
  );
};

export default Blog;

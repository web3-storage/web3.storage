import fs from 'fs';

import { useCallback, useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import matter from 'gray-matter';
import { useRouter } from 'next/router';
import { uniq } from 'lodash';

import { usePagination } from '../../components/blog/usePagination';
import Categories from '../../components/blog/categories';
import Tags from '../../components/blog/tags';
import { Card } from '../../components/blog/cards';
import Button, { ButtonVariant } from '../../components/button/button';
import useQueryParams from 'ZeroHooks/useQueryParams';
import Modal from 'ZeroComponents/modal/modal';
import CloseIcon from 'assets/icons/close';

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
 * @param {number} props.pageNumber
 * @param {(pageNumber: number) => void} props.setPageNumber
 * @param {string[]} [props.selectedCategory]
 * @returns {JSX.Element}
 */
const Paginated = ({ items, pageNumber, setPageNumber }) => {
  const paginationRange = usePagination({
    totalCount: items.length,
    pageSize: BLOG_ITEMS_PER_PAGE,
    currentPage: pageNumber,
  });

  /**
   * items hook
   * @param {Object} items
   */
  const useItems = items => {
    const [currentItems, setCurrentItems] = useState(items);

    useEffect(() => {
      const offset = (pageNumber * BLOG_ITEMS_PER_PAGE) % items.length;
      const endOffset = offset + BLOG_ITEMS_PER_PAGE;
      const sliced = items.slice(offset, endOffset);
      setCurrentItems(sliced);
    }, [items]);

    return currentItems;
  };

  const currentItems = useItems(items);

  const pageCount = Math.ceil(items.length / BLOG_ITEMS_PER_PAGE);

  const {
    push,
    query: { page, ...query },
  } = useRouter();

  useEffect(() => {
    const newPage = typeof page === 'string' ? parseInt(page) : 1;
    setPageNumber(newPage - 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  /**
   * @param {number} newPage
   */
  const handlePageClick = newPage => {
    push({
      pathname: '/blog',
      query: newPage === 1 ? query : { page: encodeURI(newPage.toString()), ...query },
    });
  };

  /**
   * @param {Object} props
   * @param {string} props.children
   * @param {boolean} [props.disabled]
   * @param {boolean} [props.isActive]
   * @param {number} [props.page]
   */
  const PagNavButton = ({ page, children, disabled, isActive }) => {
    return (
      <Button
        key={`pag-nav-item-${page || children}`}
        onClick={!page || isActive ? undefined : () => handlePageClick(page)}
        disabled={disabled}
        className={clsx(isActive && 'active', disabled && 'disabled')}
      >
        {children}
      </Button>
    );
  };

  const PaginatedNav = () => {
    const rangeButtons = paginationRange?.map(item => (
      <PagNavButton
        key={`nav-button-${item}`}
        page={typeof item === 'string' ? undefined : item}
        isActive={typeof item !== 'string' && item - 1 === pageNumber}
      >
        {item.toString()}
      </PagNavButton>
    ));
    return (
      <>
        <PagNavButton page={pageNumber} disabled={pageNumber === 0}>
          prev
        </PagNavButton>
        {rangeButtons}
        <PagNavButton page={pageNumber + 2} disabled={pageNumber === pageCount - 1}>
          next
        </PagNavButton>
      </>
    );
  };
  return (
    <div className="blog-list-container">
      {currentItems.length > 0 ? <Items currentItems={currentItems} /> : <div>More blogs coming soon</div>}
      {items.length > BLOG_ITEMS_PER_PAGE && (
        <div className="blog-pagination">
          <PaginatedNav />
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
  const [pageNumber, setPageNumber] = useState(0);

  const [category, setCategory] = useQueryParams('category');
  const [keyword, setKeyword] = useQueryParams('keyword');
  const [tagsRaw, setTags] = useQueryParams('tags');
  const tagsModalOpenState = useState(false);
  const tags = useMemo(() => (!!tagsRaw ? JSON.parse(tagsRaw) : []), [tagsRaw]);

  const categories = useMemo(() => ['All', ...uniq(posts.map(({ category }) => category)).sort()], [posts]);

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
   * @param {Object} props
   * @param {JSX.Element | string} props.children
   */
  const Backdrop = ({ children }) => <div className={clsx('grid')}>{children}</div>;

  if (posts.length === 0) return <Backdrop>There are no blogs yet 😞</Backdrop>;

  return (
    <main className="grid blog-index">
      <div className="blog-heading">
        <h4>Web3.Storage Blog</h4>
        <h1>Updates from our organization and across the Web3 universe. </h1>
        <Button variant={ButtonVariant.DARK} href="/blog/subscribe">
          Subscribe
        </Button>
      </div>
      <div className="blog-search-c">
        <div>
          <div className="blog-search-input">
            <input placeholder="Search" defaultValue={keyword} type="text" onChange={onSearch} />
          </div>
          {tags.map(tag => (
            <div key={tag}>{allTags.find(({ label }) => label.toLowerCase() === tag)?.label}</div>
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
      <Paginated key={pageNumber} items={filteredPosts} pageNumber={pageNumber} setPageNumber={setPageNumber} />
      <Modal
        className="tags-modal"
        animation="ken"
        modalState={tagsModalOpenState}
        closeIcon={<CloseIcon />}
        showCloseButton
      >
        <h1>All Tags</h1>
        <Tags tags={allTags} />
      </Modal>
    </main>
  );
};

export default Blog;

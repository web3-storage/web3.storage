import fs from 'fs';

import { useEffect, useState } from 'react';
import clsx from 'clsx';
import matter from 'gray-matter';
import { useRouter } from 'next/router';

import { usePagination } from '../../components/blog/usePagination';
import Tags from '../../components/blog/tags';
import { Card } from '../../components/blog/cards';
import Button, { ButtonVariant } from '../../components/button/button';

const BLOG_ITEMS_PER_PAGE = 10;
const allTags = ['all', 'events', 'updates', 'news'];

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
 * @param {import('../../components/types').PostMeta[]} props.items
 * @param {number} props.pageNumber
 * @param {(pageNumber: number) => void} props.setPageNumber
 * @param {string[]} [props.filters]
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
   * @param {import('../../components/types').PostMeta[]} items
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

  const router = useRouter();
  const { page } = router.query;

  useEffect(() => {
    const newPage = typeof page === 'string' ? parseInt(page) : 1;
    setPageNumber(newPage - 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  /**
   * @param {number} newPage
   */
  const handlePageClick = newPage => {
    router.push({
      pathname: '/blog',
      query: newPage === 1 ? undefined : { page: encodeURI(newPage.toString()) },
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
 * @param {string[]} props.tags
 * @param {string[]} props.filters
 * @param {(tag: string) => void} props.handleTagClick
 * @returns {JSX.Element}
 */
function TagsContainer({ tags, filters, handleTagClick }) {
  return (
    <Tags
      tags={tags.map(tag => {
        const normTag = tag.toLowerCase();
        return {
          label: normTag,
          onClick: () => handleTagClick(normTag),
          selected: filters.includes(normTag),
        };
      })}
    />
  );
}

/**
 * Blog Page
 * @param {Object} props
 */
const Blog = ({ posts }) => {
  const [currentPosts, setCurrentPosts] = useState(posts);
  const [pageNumber, setPageNumber] = useState(0);
  const [filters, setFilters] = useState(['all']);

  const router = useRouter();

  useEffect(() => {
    if (!posts) return;

    const shouldFilterPosts = filters[0] !== 'all';
    const _posts = shouldFilterPosts
      ? posts.filter(post => post.tags?.some(t => filters.includes(t.toLowerCase())))
      : posts;

    setCurrentPosts(_posts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, posts]);

  /**
   *
   * @param {string} tag
   */
  const handleTagClick = tag => {
    setFilters(prev => {
      if (tag === 'all') return ['all'];
      let newTags = prev.includes(tag) ? prev.filter(t => t.toLowerCase() !== tag) : [...prev, tag.toLowerCase()];
      newTags = newTags.filter(t => t.toLowerCase() !== 'all');
      return newTags.length > 0 ? newTags : ['all'];
    });
    if (pageNumber !== 0) {
      router.push({
        pathname: '/blog',
      });
    }
  };

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
          <form>
            <input type="text"></input>
            <input type="submit"></input>
          </form>
          <div>Tag one, Tag two, More Tags</div>
        </div>
        <TagsContainer filters={filters} handleTagClick={handleTagClick} tags={allTags} />
      </div>
      <Paginated key={pageNumber} items={currentPosts} pageNumber={pageNumber} setPageNumber={setPageNumber} />
    </main>
  );
};

export default Blog;

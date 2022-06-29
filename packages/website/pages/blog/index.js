import fs from 'fs';

import { useCallback, useMemo, useState, useEffect } from 'react';
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
import Tags from '../../components/blog/tags/tags';
import Categories from '../../components/blog/categories/categories';
import { Card } from '../../components/blog/cards/cards';
import Subscribe from '../../components/blog/subscribe/subscribe';
import GradientBackground from '../../components/gradientbackground/gradientbackground';

const BLOG_ITEMS_PER_PAGE = 8;

export async function getStaticProps() {
  const files = fs.readdirSync('posts');
  let featuredImage = null;
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
 * Blog Page
 * @param {Object} props
 */
const Blog = ({ posts = [] }) => {
  const [category, setCategory] = useQueryParams('category');
  const [keyword, setKeyword] = useQueryParams('keyword');
  const [tagsRaw, setTags] = useQueryParams('tags');
  const tagsModalOpenState = useState(false);
  const subscribeModalOpenState = useState(false);
  const tags = useMemo(() => (!!tagsRaw ? JSON.parse(tagsRaw) : []), [tagsRaw]);
  const categories = useMemo(() => ['All', ...uniq(posts.map(({ category }) => category)).sort()], [posts]);
  const sections = BlogPageData.page_content;
  const animations = BlogPageData.floater_animations;

  const Paginated = ({ items }) => {
    const [paginatedFiles, setPaginatedFiles] = useState(items);
    return (
      <div className="blog-list-container">
        {paginatedFiles.length > 0 ? (
          <>
            {paginatedFiles.map((post, i) => (
              <Card key={i} post={post} />
            ))}
          </>
        ) : (
          <h5>Hmmm... there is nothing here. Try another search term!</h5>
        )}
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
      </div>
    );
  };

  const CategoryContainer = ({ categories, selectedCategory, handleCategoryClick }) => {
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
  };

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

  // Amalgamating all tags available across all posts
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
          (!tags.length ||
            tags.every(tag => postTags.map(postTag => postTag.toLowerCase()).includes(tag.toLowerCase()))) &&
          // Filter by category
          (!category || postCategory.toLowerCase() === category) &&
          // Filter by title
          (!keyword || [postTitle, postDescription].some(item => item.toLowerCase().indexOf(keyword) >= 0))
      ),
    [posts, category, keyword, tags]
  );

  const handleCategoryClick = useCallback(
    category => {
      setCategory(category === 'all' ? '' : category);
    },
    [setCategory]
  );

  const onSearch = useCallback(
    event => {
      setKeyword(event.currentTarget.value.toLowerCase() || '');
    },
    [setKeyword]
  );

  const onRemoveTag = useCallback(
    tag => () => {
      tags.splice(tags.indexOf(tag), 1);
      setTags(JSON.stringify(tags));
    },
    [setTags, tags]
  );

  if (posts.length === 0) {
    return <h5 className="grid">There are no posts yet 😞</h5>;
  }

  return (
    <main className="grid blog-index">
      {sections.map((section, index) => (
        <BlockBuilder id={`blog_section_${index + 1}`} key={`section_${index}`} subsections={section} />
      ))}
      <Button
        className="blog-subscribe-btn"
        variant={ButtonVariant.DARK}
        onClick={() => subscribeModalOpenState[1](true)}
      >
        <span>Subscribe</span>
      </Button>
      <div className="blog-search-c grid">
        <div className="col-5_md-12_sm-12_ti-12">
          <div className="blog-search-input">
            <input placeholder="Search" defaultValue={keyword} type="text" onChange={onSearch} />
          </div>
        </div>
        <div className="blog-search-category col-7_md-12_sm-12_ti-12">
          <CategoryContainer
            selectedCategory={category}
            handleCategoryClick={handleCategoryClick}
            categories={categories}
          />
        </div>
      </div>
      <div className="blog-tag-selected-c">
        <div className="blog-tag-selected-inner">
          {tags.map(tag => (
            <Button key={tag} variant={ButtonVariant.TEXT} onClick={onRemoveTag(tag)}>
              ✕&nbsp;&nbsp;{allTags.find(({ label }) => label.toLowerCase() === tag)?.label}
            </Button>
          ))}
        </div>
        <Button className="blue" variant={ButtonVariant.TEXT} onClick={() => tagsModalOpenState[1](true)}>
          View All Tags
        </Button>
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
      <Modal
        className="file-upload-modal"
        animation="don"
        modalState={subscribeModalOpenState}
        closeIcon={<CloseIcon className="file-uploader-close" />}
        showCloseButton
      >
        <div className="blog-subscribe-modal-inner">
          <div className="background-view-wrapper">
            <GradientBackground variant="upload-cta-gradient" />
          </div>
          <Subscribe></Subscribe>
        </div>
      </Modal>
    </main>
  );
};

export default Blog;

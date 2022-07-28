import fs from 'fs';

import { useEffect, useMemo, useState } from 'react';
import matter from 'gray-matter';
import { serialize } from 'next-mdx-remote/serialize';
import { MDXRemote } from 'next-mdx-remote';
import { isEqual } from 'lodash';

import { ReactComponent as TwitterIcon } from '../../../assets/icons/twitter.svg';
import { ReactComponent as FacebookIcon } from '../../../assets/icons/facebook.svg';
import { ReactComponent as LinkedinIcon } from '../../../assets/icons/linkedin.svg';
import { ReactComponent as LinkIcon } from '../../../assets/icons/link.svg';
import BlogArticlePageData from '../../../content/pages/blog-article.json';
import BlockBuilder from '../../../components/blockbuilder/blockbuilder.js';
import { initFloaterAnimations } from '../../../lib/floater-animations.js';
import SocialLink from '../../../components/social-link';
import Tags from '../../../components/blog/tags/tags';
import { Card } from '../../../components/blog/cards/cards';
import Button, { ButtonVariant } from '../../../components/button/button';
import { addTextToClipboard } from '../../../lib/utils';
import CodeHighlightCopy from '../../../components/blog/codehighlightcopy/codehighlightcopy';

export async function getStaticProps({ ...ctx }) {
  // get individual post
  const { slug } = ctx.params;
  const fileText = fs.readFileSync(`posts/${slug}.mdx`).toString();
  const { data, content } = matter(fileText);
  const post = {
    meta: {
      ...data,
      slug,
    },
    content: await serialize(content),
  };

  // get all posts
  const files = fs.readdirSync('posts');
  files.sort().reverse();
  const posts = files
    ? files
        .filter(filename => !filename.startsWith('.'))
        .map((fn, index) => {
          const content = fs.readFileSync(`posts/${fn}`).toString();
          const info = matter(content);
          return {
            ...info.data,
            slug: fn.split('.')[0],
          };
        })
    : [];

  return {
    props: {
      posts,
      post: post,
      title: data.title + ' - Web3.Storage',
      image: data.thumbnail,
      description: data.description,
    },
  };
}

const RelatedPosts = ({ items }) => (
  <>
    {items.map((post, i) => (
      <Card key={i} post={post} />
    ))}
  </>
);

/**
 * Blog Post Page
 *
 * @param {Object} props
 * @returns {JSX.Element}
 */
const Post = ({ post, posts }) => {
  const [showCopied, setShowCopied] = useState(false);
  const sections = BlogArticlePageData.page_content;
  const animations = BlogArticlePageData.floater_animations;
  const SHARE_TEXT = '';
  // localhost will not work as currentUrl with fb or linkedin
  const [currentUrl, setCurrentUrl] = useState('');
  useEffect(() => setCurrentUrl(window.location.href), []);
  const twitterShareLink = new URL('https://twitter.com/intent/tweet');
  const twitterParams = {
    url: currentUrl,
    text: SHARE_TEXT,
    hashtags: 'web3.storage',
  };
  const facebookShareLink = new URL('https://www.facebook.com/sharer/sharer.php');
  const facebookParams = {
    u: currentUrl,
    quote: SHARE_TEXT,
    hashtag: '#web3.storage',
  };
  const linkedinShareLink = new URL('https://www.linkedin.com/sharing/share-offsite');
  const linkedinParams = { url: currentUrl };

  const { prevPostSlug, nextPostSlug } = useMemo(() => {
    const currentPostIndex = posts.findIndex(targetPost => isEqual(targetPost, post.meta));

    return {
      prevPostSlug: posts[currentPostIndex - 1]?.slug,
      nextPostSlug: posts[currentPostIndex + 1]?.slug,
    };
  }, [posts, post]);

  /*
   * Related Posts
   *
   * Add in most recent posts of same category first
   * If related posts < 4 still, add in posts with matching tags (sorted by most tags which match first)
   * If related posts < 4 still, add in posts at random from the remaining pool
   */
  const relatedPosts = useMemo(() => {
    const currentRelatedPosts = [];
    const currentPost = posts.find(filteredPost => isEqual(filteredPost, post.meta));

    // Add posts by category first, sorting by newest
    currentRelatedPosts.push(
      ...posts
        .filter(filteredPost => filteredPost !== currentPost && filteredPost.category === currentPost.category)
        .sort(({ date: dateA }, { date: dateB }) => new Date(dateB).getTime() - new Date(dateA).getTime())
        .slice(0, 4)
    );

    if (currentRelatedPosts.length < 4) {
      // Adding posts that have similar tags
      currentRelatedPosts.push(
        ...posts
          .filter(
            filteredPost =>
              filteredPost !== currentPost &&
              // Filtering out posts already added
              currentRelatedPosts.indexOf(filteredPost) === -1 &&
              // Filtering out posts that do not contain any of the same tags
              currentPost.tags.some(tag => filteredPost.tags.indexOf(tag) >= 0)
          )
          // Sort by most amount of common tags
          .sort(
            ({ tags: tagsA }, { tags: tagsB }) =>
              tagsB.filter(tag => currentPost.tags.indexOf(tag) >= 0).length -
              tagsA.filter(tag => currentPost.tags.indexOf(tag) >= 0).length
          )
          .slice(0, 4 - currentRelatedPosts.length)
          // Sort by latest
          .sort(({ date: dateA }, { date: dateB }) => new Date(dateB).getTime() - new Date(dateA).getTime())
      );
    }

    const unusedPosts = posts.filter(filteredPost => currentRelatedPosts.indexOf(filteredPost) === -1);
    while (currentRelatedPosts.length < 4 && !!unusedPosts.length) {
      // Adding in posts by random if they exist
      currentRelatedPosts.push(unusedPosts.splice(Math.floor(Math.random() * (unusedPosts.length - 1)), 1).pop());
    }

    return currentRelatedPosts;
  }, [post, posts]);

  useEffect(() => {
    CodeHighlightCopy('.post-content pre');
  }, []);

  // floater animations
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

  return (
    <div className="blog-single-post grid">
      {sections.map((section, index) => (
        <BlockBuilder id={`blog-article_section_${index + 1}`} key={`section_${index}`} subsections={section} />
      ))}

      <div className="post grid">
        <div className="post-heading">
          <h1>{post.meta.title}</h1>
          <p className="post-author">{post.meta.author}</p>
          <div className="post-heading-img">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.meta.thumbnail} alt={`Banner for ${post.meta.title}`} />
          </div>
        </div>
        <div className="post-meta">
          <div className="post-meta-date">{post.meta.date}</div>
          <div className="post-meta-tags">
            <Tags tags={post.meta.tags} comma={true} isLinks />
          </div>
          <Button
            className="blog-category-button"
            variant={ButtonVariant.OUTLINE_DARK}
            href={`/blog?category=${post.meta.category.toLowerCase()}`}
          >
            {post.meta.category}
          </Button>
        </div>
        <div className="post-content">
          <MDXRemote {...post.content} />
        </div>
      </div>

      <div className="post-footer grid">
        <div className="post-meta">
          <div className="post-social">
            <SocialLink url={twitterShareLink} params={twitterParams} Icon={TwitterIcon} />
            <SocialLink url={facebookShareLink} params={facebookParams} Icon={FacebookIcon} />
            <SocialLink url={linkedinShareLink} params={linkedinParams} Icon={LinkedinIcon} />
            <button>
              <LinkIcon
                onClick={() => {
                  addTextToClipboard(currentUrl);
                  setShowCopied(true);
                  setTimeout(() => {
                    setShowCopied(false);
                  }, 1000);
                }}
              />
              <span className={showCopied ? 'copied show' : 'copied'}>copied!</span>
            </button>
          </div>
          <div className="post-meta-tags">
            <Tags tags={post.meta.tags} comma={true} isLinks />
          </div>
          <Button
            className="blog-category-button"
            variant={ButtonVariant.OUTLINE_DARK}
            href={`/blog?category=${post.meta.category.toLowerCase()}`}
          >
            {post.meta.category}
          </Button>
        </div>
      </div>
      <div className="post-pagination">
        {prevPostSlug ? (
          <Button variant={ButtonVariant.TEXT_ARROW_LEFT} href={`/blog/post/${prevPostSlug}`}>
            Previous
          </Button>
        ) : (
          <span />
        )}
        {nextPostSlug ? (
          <Button variant={ButtonVariant.TEXT_ARROW} href={`/blog/post/${nextPostSlug}`}>
            Next
          </Button>
        ) : (
          <span />
        )}
      </div>
      <div className="post-related grid">
        <h2 className="h1">You may also like</h2>
        <div className="blog-list-container no-side-padding">
          <RelatedPosts items={relatedPosts} />
        </div>
      </div>
    </div>
  );
};

export async function getStaticPaths() {
  const files = fs.readdirSync('posts');
  const paths = files.map(file => ({
    params: {
      slug: file.split('.')[0],
    },
  }));

  return {
    paths,
    fallback: false,
  };
}

export default Post;

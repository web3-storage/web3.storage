import fs from 'fs';

import { useEffect, useMemo, useState } from 'react';
import matter from 'gray-matter';
import { serialize } from 'next-mdx-remote/serialize';
import { MDXRemote } from 'next-mdx-remote';
import { isEqual } from 'lodash';

import { ReactComponent as TwitterIcon } from '../../../assets/icons/twitter.svg';
import { ReactComponent as FacebookIcon } from '../../../assets/icons/facebook.svg';
import { ReactComponent as LinkedinIcon } from '../../../assets/icons/linkedin.svg';
import { ReactComponent as RedditIcon } from '../../../assets/icons/reddit.svg';
import { ReactComponent as LinkIcon } from '../../../assets/icons/link.svg';
import SocialLink from '../../../components/social-link';
import Tags from '../../../components/blog/tags';
import { Card } from '../../../components/blog/cards';

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
      title: data.title,
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
  const SHARE_TEXT = '';
  // localhost will not work as currentUrl with fb or linkedin
  const [currentUrl, setCurrentUrl] = useState('');
  useEffect(() => setCurrentUrl(window.location.href), []);
  const twitterShareLink = new URL(`https://twitter.com/intent/tweet`);
  const twitterParams = {
    url: currentUrl,
    text: SHARE_TEXT,
    hashtags: 'web3.storage',
  };
  const facebookShareLink = new URL(`https://www.facebook.com/sharer/sharer.php`);
  const facebookParams = {
    u: currentUrl,
    quote: SHARE_TEXT,
    hashtag: '#web3.storage',
  };
  const linkedinShareLink = new URL('https://www.linkedin.com/sharing/share-offsite');
  const linkedinParams = { url: currentUrl };
  const redditShareLink = new URL('https://www.reddit.com/submit');
  const redditParams = { url: currentUrl };

  /*
   * Related Posts
   *
   * if category has > 4 posts, show latest (most recent first) from that category
   * else if category has 0 to 3 posts show as many as possible first, and then just show
   * recent posts from any category until we have 4 posts
   *
   * If the blog itself has fewer than 4 posts, only show as many cards as we have
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

  // add image caption
  useEffect(() => {
    const allImages = document.querySelectorAll('.post-content img');
    if (allImages) {
      for (let i = 0; i < allImages.length; i++) {
        let caption = allImages[i].getAttribute('title');
        if (caption) {
          let captionDiv = document.createElement('div');
          captionDiv.className = 'caption';
          captionDiv.innerHTML = caption;
          allImages[i].after(captionDiv);
        }
      }
    }
  }, []);

  return (
    <div className="blog-single-post">
      <div className="post grid">
        <div className="post-heading">
          <h1>{post.meta.title}</h1>
          <p className="post-author">{post.meta.author}</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.meta.thumbnail} alt={`Banner for ${post.meta.title}`} />
        </div>
        <div className="post-meta">
          <div className="post-meta-date">{post.meta.date}</div>
          <div className="post-meta-tags">
            <Tags tags={post.meta.tags} />
          </div>
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
            <SocialLink url={redditShareLink} params={redditParams} Icon={RedditIcon} />
            <SocialLink url={linkedinShareLink} params={linkedinParams} Icon={LinkedinIcon} />
            <LinkIcon />
          </div>
          <div className="post-meta-tags">
            <Tags tags={post.meta.tags} />
          </div>
        </div>
      </div>

      <div className="post-related grid">
        <h1>You may also like</h1>
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

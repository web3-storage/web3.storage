import React from 'react';
// import Tags from './tags';
// custom styles from /styles/blog.css

/**
 * Blog Card Component
 *
 * @param {Object} props
 * @returns {JSX.Element}
 */

export const Card = ({ post }) => (
  <a href={`/blog/post/${post.slug}`}>
    <h3 className="blog-card-title" title={post.title}>
      {post.title}
    </h3>
    <span className="blog-card-author">{post.author}</span>
    <span className="blog-card-date">{post.date}</span>

    <div className="blog-card-img">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={post.thumbnail} alt={`Banner for ${post.title}`} />
    </div>
    {/* <div className="blog-card-tags">{post.tags && <Tags tags={post.tags} />}</div> */}
    <p className="blog-card-desc" title={post.description}>
      {post.description}
    </p>
  </a>
);

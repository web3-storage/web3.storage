import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
// import Tags from './tags';
// custom styles from /styles/blog.css

/**
 * Blog Card Component
 *
 * @param {Object} props
 * @returns {JSX.Element}
 */

export const Card = ({ post }) => (
  <Link passHref href={`/blog/post/${post.slug}`}>
    <h3 className="blog-card-title" title={post.title}>
      {post.title}
    </h3>
    <span className="blog-card-author">{post.author}</span>
    <span className="blog-card-date">{post.date}</span>

    <div className="blog-card-img">
      <Image src={post.thumbnail} alt={`Banner for ${post.title}`} />
    </div>
    {/* <div className="blog-card-tags">{post.tags && <Tags tags={post.tags} />}</div> */}
    <p className="blog-card-desc" title={post.description}>
      {post.description}
    </p>
  </Link>
);

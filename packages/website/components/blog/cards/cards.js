import React from 'react';
import Link from 'next/link';

import Button, { ButtonVariant } from '../../button/button';

/**
 * Blog Card Component
 *
 * @param {Object} props
 * @returns {JSX.Element}
 */
export const Card = ({ post }) => (
  <Link passHref href={`/blog/post/${post.slug}`}>
    <div className="blog-card">
      <div className="blog-card-img">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={post.thumbnail} alt={`Banner for ${post.title}`} />
      </div>

      <div className="blog-card-meta">
        <span className="blog-card-author">{post.author}</span>
        <span className="blog-card-date">{post.date}</span>
      </div>

      <h4 className="blog-card-title" title={post.title}>
        {post.title}
      </h4>

      <Button variant={ButtonVariant.TEXT} className="blue">
        Read More
      </Button>
    </div>
  </Link>
);

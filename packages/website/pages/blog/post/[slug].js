import fs from 'fs';

import matter from 'gray-matter';
import { serialize } from 'next-mdx-remote/serialize';
import { MDXRemote } from 'next-mdx-remote';
import Link from 'next/link';
import Image from 'next/image';

import Tags from '../../../components/blog/tags';

export async function getStaticProps({ ...ctx }) {
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

  return {
    props: {
      post: post,
      title: data.title,
      image: data.thumbnail,
      description: data.description,
      altLogo: true,
      needsUser: false,
    },
  };
}

/**
 * Blog Post Page
 *
 * @param {Object} props
 * @returns {JSX.Element}
 */
const Post = ({ post }) => {
  return (
    <div className="blog">
      <div className="post">
        <Image src={post.meta.thumbnail} alt={`Banner for ${post.meta.title}`} />
        <div>
          <div className="post-meta mb4">
            <Link href="/blog/subscribe">Subscribe</Link>
            <h1>{post.meta.title}</h1>
            {post.meta?.tags ? <Tags tags={post.meta.tags} /> : <div></div>}
            <p>{post.meta.description}</p>
            <div>
              <span>{post.meta.author}</span>
              <span>{post.meta.date}</span>
            </div>
          </div>
          <MDXRemote {...post.content} />
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

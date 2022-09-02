import Image from 'next/image';

/**
 * @typedef {{src: string, height: number, width: number, blurDataURL: string}} ImageImport
 */

const normalizeSrc = (/** @type {string} */ src) => {
  return src.startsWith('/') ? src.slice(1) : src;
};

/**
 * Logo Component
 *
 * @param  {Object} logo
 * @param  {string} logo.src
 * @param  {number} logo.width
 * @param  {number} [logo.quality]
 */
const cloudflareImageLoader = ({ src, width, quality = 75 }) => {
  let source = normalizeSrc(src);
  return `https://images.web3.storage/width=${width},quality=${quality}/${source}`;
};

/**
 * @param {{
 *  src: string | ImageImport
 *  width?: number | string
 *  height?: number | string
 *  alt?: string
 *  className?: string
 *  layout?: import('next/image').ImageProps['layout']
 *  priority?: import('next/image').ImageProps['priority']
 * }} props
 * @returns
 */
export default function Img({ src, alt, width, height, className, layout, priority }) {
  if (typeof src === 'string' && src.includes('.svg')) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} width={width} height={height} className={className} />;
  }

  if (typeof src === 'object' && src.src && src.src.includes('.svg')) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src.src} alt={alt} width={width} height={height} className={className} />;
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      layout={layout}
      loader={cloudflareImageLoader}
      priority={priority}
    />
  );
}

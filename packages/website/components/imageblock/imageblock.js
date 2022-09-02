import clsx from 'clsx';

import Img from '../cloudflareImage.js';

/**
 * @param {Object} props.block
 */
export default function ImageBlock({ block }) {
  return (
    <>
      {block.src && (
        <div id={block.id} className={clsx('block', 'image-block')}>
          <Img layout="fill" alt={block.alt} src={block.src} />
          <div className={'image-label'}>{block.label}</div>
        </div>
      )}
    </>
  );
}

// ===================================================================== Imports
import clsx from 'clsx';
import Image from 'next/image';
// import image from '../../public/images/filecoin-logo.png'
// console.log(image.src)
// ====================================================================== Params
/**
 * @param {Object} props.block
 */
// ====================================================================== Export
export default function ImageBlock({ block }) {
  return (
    <>
      {block.src && (
        <div id={block.id} className={clsx('block', 'image-block')}>
          <Image src={block.src} layout="fill" />

          <div className={'image-label'}>{block.label}</div>
        </div>
      )}
    </>
  );
}

import clsx from 'clsx';
import { useState } from 'react';

import Modal from 'modules/zero/components/modal/modal';
import Dropzone from 'modules/zero/components/dropzone/dropzone';
import GradientBackgroundB from 'assets/illustrations/gradient-background-b';
import CloseIcon from 'assets/icons/close';
import InfinityIcon from 'assets/icons/infinity';
import GlobeIcon from 'assets/icons/globe';
import { ReactComponent as FolderIcon } from '../../../assets/icons/folder.svg';

export const CTAThemeType = {
  LIGHT: 'light',
  DARK: 'dark',
};

/**
 * @typedef {Object} UploadContentProps
 * @property {string} [className]
 * @property {import('react').ReactNode} [icon]
 * @property {string} [heading]
 * @property {string} [description]
 */

/**
 *
 * @param {UploadContentProps} props
 * @returns
 */
const uploadContentBlock = (heading, iconType, description) => {
  let icon;
  switch (iconType) {
    case 'globe_icon':
      icon = <GlobeIcon />;
      break;
    case 'infinity_icon':
      icon = <InfinityIcon />;
      break;
    default:
      icon = <FolderIcon />;
  }
  return (
    <div key={heading} className="upload-content-block">
      <div className="upload-content-block-heading">
        {icon}
        {heading}
      </div>
      <div className="upload-content-block-description">{description}</div>
    </div>
  );
};

/**
 * @typedef {Object} FileUploaderProps
 * @property {string} [className] - optional
 * @property {object} [content]
 * @property {any} [uploadModalState]
 * @property {import('react').ReactNode} [background]
 */

/**
 *
 * @param {FileUploaderProps} props
 * @returns
 */
const FileUploader = ({ className = '', content, uploadModalState, background }) => {
  const [filesToUpload, setFilesToUpload] = useState([]);

  return (
    <div className={'file-upload-modal'}>
      <Modal
        className=""
        closeIcon={<CloseIcon className="file-uploader-close" />}
        modalState={uploadModalState}
        showCloseButton
      >
        <div className={clsx(className, 'file-uploader-container')}>
          {background}
          <GradientBackgroundB className="account-gradient-background" />
          <h5>{!!filesToUpload.length ? content.heading.option_1 : content.heading.option_2}</h5>
          <div className={'file-upload-subheading'} dangerouslySetInnerHTML={{ __html: content.subheading }}></div>
          <Dropzone
            className="file-uploader-dropzone"
            onChange={files => {
              console.log('file change');
              setFilesToUpload(filesToUpload.concat(files));
            }}
            onError={() => {
              console.log('error');
            }}
            icon={<FolderIcon />}
            dragAreaText={content.drop_prompt}
            maxFiles={3}
            multiple={true}
          />

          {content.blocks.map(block => uploadContentBlock(block.heading, block.icon, block.description))}
        </div>
      </Modal>
    </div>
  );
};

export default FileUploader;

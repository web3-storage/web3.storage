import clsx from 'clsx';
import Link from 'next/link';
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
const UploadContentBlock = ({ className, heading, icon, description }) => (
  <div className={clsx(className, 'upload-content-block')}>
    <div className="upload-content-block-heading">
      {icon}
      {heading}
    </div>
    <div className="upload-content-block-description">{description}</div>
  </div>
);

/**
 * @typedef {Object} FileUploaderProps
 * @property {string} [className] - optional
 * @property {any} [uploadModalState]
 * @property {import('react').ReactNode} [background]
 */

/**
 *
 * @param {FileUploaderProps} props
 * @returns
 */
const FileUploader = ({ className = '', uploadModalState, background }) => {
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
          <h5>Upload {!!filesToUpload.length ? 'more files' : 'a file'}</h5>
          <div className={'file-upload-subheading'}>
            You can also upload files using the{'\u00A0'}
            <Link href="https://www.npmjs.com/package/web3.storage">JS Client Library.</Link>
          </div>
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
            dragAreaText="Drag and drop your files here"
            maxFiles={3}
            multiple={true}
          />
          <UploadContentBlock
            className="upload-content-block-public"
            icon={<GlobeIcon />}
            heading="Public Data"
            description="All data uploaded to Web3.Storage is available to anyone who requests it using the correct CID. Do not store any private or sensitive information in an unencrypted form using Web3.Storage."
          />
          <UploadContentBlock
            className="upload-content-block-permanent"
            icon={<InfinityIcon />}
            heading="Permanent Data"
            description="Deleting files from the Web3.Storage site’s Files page will remove them from the file listing for your account, but that doesn’t prevent nodes on the decentralized storage network from retaining copies of the data indefinitely. Do not use Web3.Storage for data that may need to be permanently deleted in the future."
          />
        </div>
      </Modal>
    </div>
  );
};

export default FileUploader;

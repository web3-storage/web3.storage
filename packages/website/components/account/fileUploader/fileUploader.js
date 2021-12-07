import clsx from 'clsx';

import Modal from 'modules/zero/components/modal/modal';
import Dropzone from 'modules/zero/components/dropzone/dropzone';

export const CTAThemeType = {
  LIGHT: 'light',
  DARK: 'dark',
};

/**
 * @typedef {Object} FileUploaderProps
 * @property {string} [className] - optional
 * @property {any} [uploadModalState]
 */

/**
 *
 * @param {FileUploaderProps} props
 * @returns
 */
const FileUploader = ({ className = '', uploadModalState }) => {
  return (
    <Modal modalState={uploadModalState} showCloseButton className={clsx(className, 'file-uploader-container')}>
      <Dropzone
        onChange={() => {
          console.log('file change');
        }}
        onError={() => {
          console.log('error');
        }}
      />
    </Modal>
  );
};

export default FileUploader;

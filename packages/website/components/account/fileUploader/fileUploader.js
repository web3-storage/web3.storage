import clsx from 'clsx';

import Modal from 'modules/zero/components/modal/modal';
import Dropzone from 'modules/zero/components/dropzone/dropzone';
import { ReactComponent as OpenIcon } from '../../../assets/icons/open.svg';

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
        icon={<OpenIcon />}
        dragAreaText="Drag and drop your files here"
        maxFiles={2}
        accept={'image/jpeg, image/png'}
        multiple={true}
      />
    </Modal>
  );
};

export default FileUploader;

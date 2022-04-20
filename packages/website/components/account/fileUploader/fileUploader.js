import clsx from 'clsx';
import { useState, useCallback, useMemo, useEffect, useRef } from 'react';

import Modal from 'modules/zero/components/modal/modal';
import Dropzone from 'modules/zero/components/dropzone/dropzone';
import GradientBackground from '../../gradientbackground/gradientbackground.js';
import CloseIcon from 'assets/icons/close';
import InfinityIcon from 'assets/icons/infinity';
import GlobeIcon from 'assets/icons/globe';
import { ReactComponent as FolderIcon } from '../../../assets/icons/folder.svg';
import { STATUS, useUploads } from 'components/contexts/uploadsContext';

export const CTAThemeType = {
  LIGHT: 'light',
  DARK: 'dark',
};

/**
 * @typedef {Object} UploadContentProps
 * @property {string} [heading]
 * @property {string} [iconType]
 * @property {string} [description]
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
  const [filesToUpload, setFilesToUpload] = useState(/** @type {File[]} */ ([]));
  const [uploadRates, setUploadRates] = useState(/** @type {number[]} */ ([]));
  const { getUploads, uploadFiles, uploadsProgress, clearUploadedFiles } = useUploads();
  const lastChunks = useRef(/** @type {object[]} */ ([]));

  // Mapped out file progress info
  const filesInfo = useMemo(
    () =>
      Object.values(uploadsProgress.files).map(({ inputFile, progress, uploadId, status }, i) => ({
        uploadId,
        name: inputFile.name,
        progress: progress.percentage,
        failed: status === STATUS.FAILED,
        time: Date.now(),
      })),
    [uploadsProgress]
  );

  // Calculate upload rate using difference between percentages at chunk intervals
  useEffect(() => {
    const array = [];
    const rates = [];
    filesInfo.forEach((file, i) => {
      rates.push(0.1);
      const lastChunk = lastChunks.current[i];
      if (lastChunk !== undefined) {
        rates[i] = ((file.progress - lastChunk.progress) / (Date.now() - lastChunk.time)) * 100;
      }
      array[i] = {
        progress: file.progress,
        time: file.time,
      };
    });
    lastChunks.current = array;
    setUploadRates(rates);
  }, [filesInfo, lastChunks]);

  // Rate added to files info
  const uploadsInfo = filesInfo.map((upload, i) => ({ rate: uploadRates[i] ? uploadRates[i] : 0.1, ...upload }));

  return (
    <div className={'file-upload-modal'}>
      <Modal
        className=""
        closeIcon={<CloseIcon className="file-uploader-close" />}
        modalState={uploadModalState}
        showCloseButton
        onClose={useCallback(() => {
          // Clearing uploads and updating list if there are new files
          if (clearUploadedFiles()) {
            getUploads();
          }
        }, [getUploads, clearUploadedFiles])}
      >
        <div className={clsx(className, 'file-uploader-container')}>
          <div className="background-view-wrapper">
            {background}
            <GradientBackground variant="upload-cta-gradient" />
          </div>
          <h5>{!!filesToUpload.length ? content.heading.option_1 : content.heading.option_2}</h5>
          <div className={'file-upload-subheading'} dangerouslySetInnerHTML={{ __html: content.subheading }}></div>
          <Dropzone
            className="file-uploader-dropzone"
            onChange={useCallback(
              files => {
                uploadFiles(files);
                setFilesToUpload(filesToUpload.concat(files));
              },
              [filesToUpload, uploadFiles]
            )}
            onError={e => {
              console.error('error', e);
            }}
            icon={<FolderIcon />}
            dragAreaText={content.drop_prompt}
            maxFiles={3}
            multiple={true}
            filesInfo={uploadsInfo}
          />

          {content.blocks.map(block => uploadContentBlock(block.heading, block.icon, block.description))}
        </div>
      </Modal>
    </div>
  );
};

export default FileUploader;

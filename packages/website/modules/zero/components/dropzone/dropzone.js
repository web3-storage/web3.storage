import clsx from 'clsx'
import { useDropzone } from "react-dropzone";

import styles from './dropzone.module.scss';

/**
 * @typedef {Object} DropzoneProps
 * @prop {string} [className]
 * @prop {ReactComponent} [icon]
 * @prop {string} [dragAreaText]
 */

const Dropzone = ({
  className,
  icon,
  dragAreaText,
}) => {
  const {acceptedFiles, getRootProps, getInputProps} = useDropzone();
  
  return (
    <div className={clsx(className, styles.dropzone)}>
      <div {...getRootProps({className: styles.droparea})}>
        <input className={styles.inputField} {...getInputProps()} />
        {icon && (
          <div className={styles.icon}>
            {icon}
          </div>
        )}
        {dragAreaText
          && <p className={styles.dragAreaText}>{dragAreaText}</p>
        }
      </div>
      <div className={styles.filelist}>
        {acceptedFiles.map((file, i) => (
          <>
            <div key={`file-${i}`} className={styles.filename}>
              {file.path}
            </div>
            <div key={`status-${i}`} className={styles.status}>
              status{console.log(file)}
            </div>
          </>
        ))}
      </div>
    </div>
  );
}

Dropzone.defaultProps = {}

export default Dropzone

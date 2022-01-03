import { useCallback, Fragment } from 'react'
import { useDropzone } from "react-dropzone";
import clsx from 'clsx'

/**
 * @typedef {Object} DropzoneProps
 * @prop {string} [className]
 * @prop {ReactComponent} [icon]
 * @prop {string} [dragAreaText]
 * @prop {function} [onChange]
 * @prop {function} [onError]
 */

const Dropzone = ({
  className,
  icon,
  dragAreaText,
  onChange,
  onError,
  ...props
}) => {
  const onDropAccepted = useCallback((files) => onChange && onChange(files), [])
  
  const onDropRejected = useCallback((files) => onError && onError(files), [])

  const {acceptedFiles, fileRejections, getRootProps, getInputProps} = useDropzone({onDropAccepted, onDropRejected, ...props});

  return (
    <div className={clsx(className, 'Dropzone')}>
      <div {...getRootProps({className: 'droparea'})}>
        <input className="inputField" name="file" {...getInputProps()} />
        {icon && (
          <div className="icon">
            {icon}
          </div>
        )}
        {dragAreaText
          && <p className="dragAreaText">{dragAreaText}</p>
        }
      </div>
      <div className="filelist">
        {acceptedFiles.map((file, i) => (
          <Fragment key={`file-${i}`}>
            <div className="filename">
              {file.path}
            </div>
            <div className="status">
              {file.size}
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
}

Dropzone.defaultProps = {}

export default Dropzone

import { useCallback, Fragment, useMemo, useEffect } from 'react'
import { useDropzone } from "react-dropzone";
import clsx from 'clsx'

/**
 * @typedef {Object} DropzoneProps
 * @prop {string} [className]
 * @prop {React.ReactNode} [icon]
 * @prop {string} [dragAreaText]
 * @prop {function} [onChange]
 * @prop {function} [onError]
 * @prop {number} [maxFiles]
 * @prop {string} [accept]
 * @prop {boolean} [multiple]
 */

/**
 * 
 * @param {DropzoneProps} props 
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

  const filesInfo = useMemo(() => acceptedFiles.reduce((acc, value) => (acc[/** @type {any} */(value).path] = acc[/** @type {any} */(value).path] || { progress: 0 }) && acc, filesInfo || {}), [acceptedFiles])

  useEffect(() => {
    // TODO: Hook up to real file upload
    const interval = setInterval(() => {
      Object.keys(filesInfo).forEach((key) => {
        filesInfo[key].progress = Math.floor(Math.min(filesInfo[key].progress + Math.random() * 10, 100))

        if(filesInfo[key].progress === 100)
          clearInterval(interval)
      })
    }, 1000);
    return () => clearInterval(interval)
  }, [filesInfo])

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
              {/** @type {any} */ (file).path}
            </div>
            <div className="status">
              {filesInfo[/** @type {any} */ (file).path].progress !== 100 ? `Loading... ${filesInfo[/** @type {any} */(file).path].progress}%` : `Complete`}
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
}

Dropzone.defaultProps = {}

export default Dropzone

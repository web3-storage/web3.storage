import React, { useCallback } from 'react'
import useState from 'storybook-addon-state';
import Button from 'ZeroComponents/button/button';
import Dropzone from './dropzone';
import { ReactComponent as OpenIcon } from 'Icons/open.svg'

export default {
  title: 'Zero/Dropzone'
};

export const Default = () => (
  <Dropzone
    icon={<OpenIcon />}
    dragAreaText="Drag and drop your files here"
  />
);

export const FileReader = () => {
  const [files, setFiles] = useState('files', null);

  const onFileChangeSuccess = useCallback((acceptedFiles) => setFiles(acceptedFiles), []);
  const onFileChangeError = useCallback((rejectedFiles) => console.error(rejectedFiles), []);

  const handleSubmit = (e) => {
    e.preventDefault();

    if(files)
      files.forEach((file) => {
        const reader = new FileReader()
        reader.onabort = () => console.log('file reading was aborted')
        reader.onerror = () => console.log('file reading has failed')
        reader.onload = () => console.log(reader.result)
        reader.readAsArrayBuffer(file)
      })
  };

  return (
    <form onSubmit={handleSubmit}>
      <Dropzone
        icon={<OpenIcon />}
        dragAreaText="Drag and drop your files here"
        maxFiles={2}
        accept={'image/jpeg, image/png'}
        multiple={true}
        onChange={onFileChangeSuccess}
        onError={onFileChangeError}
      />
      <Button type="submit">Upload</Button>
    </form> 
  )
};

export const FormData = () => {
  const [files, setFiles] = useState('files', null);

  const onFileChangeSuccess = useCallback((acceptedFiles) => setFiles(acceptedFiles), []);
  const onFileChangeError = useCallback((rejectedFiles) => console.error(rejectedFiles), []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    let formData = new FormData(e.target);

    if(files)
      files.forEach((file) => {
        formData.append('files', file, file.name)
      })
  }, []);

  return (
    <form encType="multipart/form-data" onSubmit={handleSubmit}>
      <input type="text" name="test" />
      <Dropzone
        icon={<OpenIcon />}
        dragAreaText="Drag and drop your files here"
        maxFiles={2}
        accept={'image/jpeg, image/png'}
        multiple={true}
        onChange={onFileChangeSuccess}
        onError={onFileChangeError}
      />
      <Button type="submit">Upload</Button>
    </form> 
  )
};

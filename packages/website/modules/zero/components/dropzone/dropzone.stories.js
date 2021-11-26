import React from 'react';
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

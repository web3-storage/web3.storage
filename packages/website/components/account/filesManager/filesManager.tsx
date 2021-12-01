import clsx from 'clsx';

type FilesManagerProps = {
  className?: string;
};

const FilesManager = ({ className }: FilesManagerProps) => {
  return <div className={clsx('section files-manager-container', className)}>TODO: Files Manager Content</div>;
};

export default FilesManager;

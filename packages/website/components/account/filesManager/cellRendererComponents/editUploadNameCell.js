import { useRef, useState } from 'react';
import clsx from 'clsx';

import PencilIcon from 'assets/icons/pencil';
import Loading from 'components/loading/loading';

/**
 * @type {import('react').FC}
 * @param {Object} props
 * @param {string} props.name Name of the upload.
 * @param {string} props.cid CID of the upload.
 * @param {function} props.onNameEdit On edit callback.
 * @param {function} props.renameUploadAction Async method to call to rename the upload.
 * @returns
 */
function EditUploadNameRenderer({ name, cid, onNameEdit, renameUploadAction }) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editError, setEditError] = useState('');

  /** @type {import('react').RefObject<HTMLTextAreaElement>} */
  const textAreaInput = useRef(null);

  const toggleEdit = () => {
    setIsEditingName(!isEditingName);
  };

  const saveNewName = async (oldName, cid) => {
    const newName = textAreaInput.current?.value;

    setIsLoading(true);

    try {
      await renameUploadAction(cid, newName);
    } catch (error) {
      setEditError('Unable to set name.');
    }

    if (editError) {
      setEditError('');
    }

    setIsLoading(false);
    toggleEdit();
    onNameEdit();
  };

  return (
    <div className="file-name">
      <div className={clsx(isEditingName && 'editing', 'file-name__container')}>
        {/* <span className="file-row-label medium-down-only">{'fileRowLabels.name.label'}</span> */}
        {!isEditingName ? (
          <span>{name}</span>
        ) : (
          <span className="textarea-container">
            <textarea
              className={clsx(editError && 'file-name__textarea--error', 'file-name__textarea')}
              ref={textAreaInput}
              disabled={isLoading}
              defaultValue={name}
            />
          </span>
        )}
        <div className="file-name__action-button-container">
          {isEditingName && (
            <button
              className="file-name__action-buttons file-name__action-buttons--save"
              disabled={isLoading}
              onClick={() => {
                saveNewName(name, cid);
              }}
            >
              {isLoading ? <Loading size="small" /> : 'Save'}
            </button>
          )}
          <button
            className={clsx(isEditingName && 'file-name__action-buttons--cancel', 'file-name__action-buttons')}
            disabled={isLoading}
            onClick={() => {
              toggleEdit();
            }}
          >
            {isEditingName ? 'Cancel' : <PencilIcon className={clsx('pencil-icon')} />}
          </button>
        </div>
      </div>
      {editError && isEditingName && <span className="file-name__textarea-hint-text--error">{editError}</span>}
    </div>
  );
}

export default EditUploadNameRenderer;

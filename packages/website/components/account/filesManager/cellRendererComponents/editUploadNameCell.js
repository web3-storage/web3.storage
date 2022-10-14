/**
 * @type {import('react').FC}
 * @param {object} props
 * @returns
 */
function editUploadNameRenderer({ name }) {
  // const onEditToggle = useCallback(
  //   targetCID => async (/** @type {string|undefined} */ newFileName) => {
  //     console.log('OET')
  //     setNameEditingId(targetCID !== nameEditingId ? targetCID : undefined);

  //     const fileTarget = uploads.find(({ cid }) => cid === targetCID);
  //     if (!!fileTarget && !!newFileName && newFileName !== fileTarget.name) {
  //       onUpdatingChange(true);
  //       await renameUpload(targetCID, newFileName);
  //       fileTarget.name = newFileName;
  //       onUpdatingChange(false);
  //     }
  //   },
  //   [nameEditingId, uploads, onUpdatingChange, renameUpload]
  // );

  return name;
  // const editingNameRef = useRef(null);
  // return (
  //   <span className={clsx(isEditingName && 'isEditingName', 'file-name')}>
  //     <span className="file-row-label medium-down-only">{fileRowLabels.name.label}</span>
  //     {!isEditingName ? (
  //       <span dangerouslySetInnerHTML={{ __html: name }} />
  //     ) : (
  //       <span className="textarea-container">
  //         <textarea ref={editingNameRef} defaultValue={name} />
  //       </span>
  //     )}
  //     <PencilIcon
  //       className={clsx('pencil-icon')}
  //       onClick={() => { console.log('eed'); onEditToggleProp(editingNameRef.current?.value)}}
  //     />
  //   </span>
  // )
}

export default editUploadNameRenderer;

const editUploadNameRenderer = ({ name }) => {
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
};

export default editUploadNameRenderer;

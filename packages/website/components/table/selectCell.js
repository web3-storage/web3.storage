import CheckIcon from 'assets/icons/check';

/**
 * @type {import('react').FC}
 *
 * Used to render a checkbox cell within a table component.
 *
 * @param {Object} props
 * @returns
 */
function SelectCell({ selected = false, id, onSelectChange }) {
  return (
    <span className="file-select">
      <input checked={selected} type="checkbox" id={id} onChange={e => onSelectChange(e.target.checked)} />
      <CheckIcon className="check" />
    </span>
  );
}

export default SelectCell;

import CheckIcon from 'assets/icons/check';

/**
 * @type {import('react').FC}
 *
 * Used to render a checkbox cell within a table component.
 *
 * @param {Object} props
 * @param {boolean} props.selected
 * @param {string|number} props.id
 * @param {function} props.onSelectChange
 * @returns
 */
function SelectCell({ selected = false, id, onSelectChange }) {
  return (
    <div className="select-cell-container">
      <span className="select-cell">
        <input checked={selected} type="checkbox" id={id.toString()} onChange={e => onSelectChange(e.target.checked)} />
        <CheckIcon className="check" />
      </span>
    </div>
  );
}

export default SelectCell;

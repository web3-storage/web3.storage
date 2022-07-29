// ===================================================================== Imports

import CheckIcon from 'assets/icons/check';
import clsx from 'clsx';
import Loading from 'components/loading/loading';
import filesize from 'filesize';
import React, { useEffect, useState } from 'react';
import Dropdown from 'ZeroComponents/dropdown/dropdown';
import Pagination from './pagination';

//TODO Move to his own compoent file
/**
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

/**
 * @typedef {Object} ColumnDefinition
 * @property {string | import('react').ReactComponentElement } headerContent
 * @property {string} id
 * @property {import('react').FC} [cellRenderer]
 * @property {function} [getCellProps]
 *
 */

// ====================================================================== Params
/**
 * @param {Object} props
 * @param {ColumnDefinition[]} props.columns
 * @param {Array<object>} props.rows
 * @param {number} props.totalRows
 * @param {number} props.itemsPerPage
 * @param {boolean} props.isEmpty
 * @param {boolean} props.isLoading
 * @param {string} props.scrollTarget
 * @param {boolean} props.withRowSelection
 * @param {import('react').ReactComponentElement}  props.emptyState
 * @param {import('react').ReactComponentElement}  props.dropdown
 * @param {import('react').ReactComponentElement}  props.deleteRowBtn
 * @param {function} props.onPageSelect
 * @param {(selectedRows: number[]) => void} [props.onRowSelect]
 */
// ====================================================================== Export
export default function Table({
  columns,
  rows,
  totalRows,
  itemsPerPage,
  isEmpty,
  emptyState,
  isLoading,
  withRowSelection,
  dropdown,
  onRowSelect,
  onPageSelect,
  deleteRowBtn,
  scrollTarget,
}) {
  /**
   * @type { ColumnDefinition[]}
   */
  let effectiveColumns = [...columns];

  const [selectedRows, setSelectedRows] = useState(/** @type {number[]} */ ([]));

  useEffect(() => {
    if (onRowSelect) {
      onRowSelect(selectedRows);
    }
  }, [selectedRows, onRowSelect]);

  const onSelectAllRows = selected => {
    let newSelected;
    if (selected) {
      newSelected = rows.map((r, i) => i).sort();
    } else {
      newSelected = [];
    }
    setSelectedRows(newSelected);
  };

  const onSelectRow = (rowIndex, value) => {
    let newSelected;
    if (value) {
      newSelected = [...selectedRows, rowIndex];
    } else {
      newSelected = selectedRows.filter(i => i !== rowIndex);
    }
    setSelectedRows(newSelected.sort());
  };

  if (withRowSelection) {
    /**
     * @type { ColumnDefinition}
     */
    const selectionColumn = {
      id: 'rowSelection',
      headerContent: (
        <SelectCell
          selected={selectedRows.length === rows.length}
          id={`table-storage-select-all`}
          onSelectChange={selected => onSelectAllRows(selected)}
        />
      ),
      cellRenderer: SelectCell,
      getCellProps: (cell, index) => {
        return {
          selected: selectedRows.includes(index),
          onSelectChange: selected => onSelectRow(index, selected),
          id: `table-storage-row-${index}-select`,
        };
      },
    };

    effectiveColumns = [selectionColumn, ...effectiveColumns];
  }

  const getRowComponent = (row, index, selected) => (
    <div role="rowgroup">
      <div className="storage-table-row" role="row" aria-rowindex={index}>
        {effectiveColumns.map(c => (
          <span key={`${c.id}-${index}`} role="cell">
            {c.cellRenderer ? (
              <c.cellRenderer {...(c.getCellProps ? c.getCellProps(row[c.id], index) : {})}></c.cellRenderer>
            ) : (
              row[c.id]
            )}
          </span>
        ))}
      </div>
    </div>
  );

  if (isEmpty && !isLoading) {
    return <div className="storage-table-table-content">{emptyState}</div>;
  }

  return (
    <div className="storage-table" role="table">
      <div role="rowgroup">
        <div className="storage-table-row storage-table-header" role="row">
          {effectiveColumns.map(c => (
            <div key={c.id} role="columnheader">
              {c.headerContent}
            </div>
          ))}
        </div>
      </div>
      <div className="storage-table-content">
        {isLoading ? <Loading className={'files-loading-spinner'} /> : rows.map((row, i) => getRowComponent(row, i))}

        {!isEmpty && (
          <div className="storage-table-footer">
            {deleteRowBtn}

            <Pagination
              className="storage-table-pagination"
              totalItems={totalRows}
              itemsPerPage={itemsPerPage || 10}
              visiblePages={1}
              queryParam="page"
              onChange={onPageSelect}
              scrollTarget={scrollTarget}
            />
            {dropdown}
          </div>
        )}
      </div>
    </div>
  );
}

// ===================================================================== Imports

import CheckIcon from 'assets/icons/check';
import Loading from 'components/loading/loading';
import React, { useCallback, useEffect, useState } from 'react';
import Dropdown from 'ZeroComponents/dropdown/dropdown';
import Pagination from './pagination';

// TODO Move to his own compoent file
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
 * @param {number} props.totalRowCount
 * @param {number} props.page
 * @param {number} props.itemsPerPage
 * @param {number[]} props.itemsPerPageOptions
 * @param {boolean} props.isEmpty
 * @param {boolean} props.isLoading
 * @param {string} props.scrollTarget
 * @param {boolean} props.withRowSelection
 * @param {import('react').ReactComponentElement}  props.emptyState
 * @param {import('react').ReactComponentElement}  [props.leftFooterSlot]
 * @param {function} props.onPageSelect
 * @param {function} props.onSetItemsPerPage
 * @param {(selectedRows: number[]) => void} [props.onRowSelect]
 */
// ====================================================================== Export
export default function Table({
  columns,
  rows,
  totalRowCount,
  page,
  itemsPerPage,
  itemsPerPageOptions,
  isEmpty,
  emptyState,
  isLoading,
  withRowSelection,
  leftFooterSlot,
  onRowSelect,
  onPageSelect,
  onSetItemsPerPage,
  scrollTarget,
}) {
  /**
   * @type { ColumnDefinition[]}
   */
  let effectiveColumns = [...columns];

  const [selectedRows, setSelectedRows] = useState(/** @type {number[]} */ ([]));

  // clear selected when rows changes, items per page changes
  useEffect(() => {
    setSelectedRows([]);
  }, [rows, itemsPerPage]);

  // clear selected when rows changes, items per page changes
  useEffect(() => {
    if (onRowSelect) {
      onRowSelect(selectedRows);
    }
  }, [selectedRows, onRowSelect]);

  const onSelectAllRows = useCallback(
    selected => {
      let newSelected;
      if (selected) {
        newSelected = rows.map((r, i) => i).sort();
      } else {
        newSelected = [];
      }
      setSelectedRows(newSelected);
    },
    [rows]
  );

  const onSelectRow = useCallback(
    (rowIndex, value) => {
      let newSelected;
      if (value) {
        newSelected = [...selectedRows, rowIndex];
      } else {
        newSelected = selectedRows.filter(i => i !== rowIndex);
      }
      setSelectedRows(newSelected.sort());
    },
    [selectedRows]
  );

  const onPageSelectHandler = useCallback(
    page => {
      setSelectedRows([]);
      onPageSelect();
    },
    [onPageSelect]
  );

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
      <div className="storage-table-row" role="row" aria-rowindex={index} aria-selected={selectedRows.includes(index)}>
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
            <div>{!!leftFooterSlot && leftFooterSlot}</div>

            <Pagination
              className="storage-table-pagination"
              page={page}
              totalRowCount={totalRowCount}
              itemsPerPage={itemsPerPage}
              visiblePages={1}
              onPageChange={onPageSelectHandler}
              scrollTarget={scrollTarget}
            />
            <Dropdown
              className="storage-table-result-dropdown"
              value={itemsPerPage}
              options={itemsPerPageOptions.map(ipp => ({
                label: `View ${ipp} results`,
                value: ipp.toString(),
              }))}
              onChange={value => onSetItemsPerPage && onSetItemsPerPage(parseInt(value))}
            />
          </div>
        )}
      </div>
    </div>
  );
}

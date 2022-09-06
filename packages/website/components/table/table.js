import React, { useCallback } from 'react';

import Loading from 'components/loading/loading';
import Dropdown from 'ZeroComponents/dropdown/dropdown';
import Pagination from 'components/table/pagination';
import SelectCell from 'components/table/selectCell';

/**
 * @typedef {Object} ColumnDefinition
 * @property {string | import('react').ReactComponentElement } headerContent
 * @property {string} id
 * @property {import('react').FC} [cellRenderer]
 * @property {function} [getCellProps]
 *
 */

/**
 * @type {import('react').FC}
 *
 * @param {Object} props
 * @param {ColumnDefinition[]} props.columns
 * @param {Array<object>} props.rows
 * @param {number} [props.totalRowCount]
 * @param {number} [props.page]
 * @param {number} [props.rowsPerPage]
 * @param {number[]} [props.rowsPerPageOptions]
 * @param {boolean} [props.isEmpty]
 * @param {boolean} [props.isLoading]
 * @param {string} [props.scrollTarget]
 * @param {boolean} [props.withRowSelection]
 * @param {import('react').ReactComponentElement}  [props.emptyState]
 * @param {import('react').ReactComponentElement}  [props.leftFooterSlot]
 * @param {number[]} [props.selectedRows] List of keys of the selected rows
 * @param {function} [props.onPageSelect]
 * @param {function} [props.onSetItemsPerPage]
 * @param {(key: number|string, value: boolean) => void} [props.onRowSelectedChange]
 * @param {(value: boolean) => void} [props.onSelectAll]
 */

function Table({
  columns,
  rows,
  totalRowCount,
  page = 0,
  rowsPerPage,
  rowsPerPageOptions,
  isEmpty = false,
  emptyState,
  isLoading = false,
  withRowSelection = false,
  leftFooterSlot,
  selectedRows,
  onRowSelectedChange,
  onSelectAll,
  onPageSelect,
  onSetItemsPerPage,
  scrollTarget = '.storage-table',
}) {
  /**
   * @type { ColumnDefinition[]}
   */
  let effectiveColumns = [...columns];

  const selectAllRowsHandler = useCallback(
    value => {
      onSelectAll && onSelectAll(value);
    },
    [onSelectAll]
  );

  const selectRowHandler = useCallback(
    (rowKey, value) => {
      onRowSelectedChange && onRowSelectedChange(rowKey, value);
    },
    [onRowSelectedChange]
  );

  const pageSelectHandler = useCallback(
    page => {
      onPageSelect && onPageSelect(page);
    },
    [onPageSelect]
  );

  const keysAllEqual = function areEqual(array1, array2) {
    if (array1.length === array2.length) {
      return array1.every(element => {
        if (array2.includes(element)) {
          return true;
        }

        return false;
      });
    }

    return false;
  };

  // If row selection is enabled add a column with checkboxes at the start.
  if (withRowSelection) {
    /**
     * @type { ColumnDefinition}
     */
    const selectionColumn = {
      id: 'rowSelection',
      headerContent: (
        // Select all checkbox in the header.
        <SelectCell
          selected={
            rows.length !== 0 &&
            keysAllEqual(
              selectedRows,
              rows.map(r => r.key)
            )
          }
          id={`table-storage-select-all`}
          onSelectChange={selected => selectAllRowsHandler(selected)}
        />
      ),
      cellRenderer: SelectCell,
      getCellProps: (cell, index) => {
        return {
          selected: selectedRows?.includes(index),
          onSelectChange: selected => selectRowHandler(index, selected),
          id: `table-storage-row-${index}-select`,
        };
      },
    };

    effectiveColumns = [selectionColumn, ...effectiveColumns];
  }

  const renderRowComponent = (row, index, selected) => {
    const rowKey = row.key || index;
    return (
      <div role="rowgroup" key={rowKey}>
        <div
          className="storage-table-row"
          role="row"
          aria-rowindex={index}
          aria-selected={selectedRows?.includes(index) || false}
        >
          {effectiveColumns.map(c => (
            <span key={`${c.id}-${rowKey}`} role="cell">
              {c.cellRenderer ? (
                <c.cellRenderer {...(c.getCellProps ? c.getCellProps(row[c.id], rowKey) : {})}></c.cellRenderer>
              ) : (
                row[c.id]
              )}
            </span>
          ))}
        </div>
      </div>
    );
  };

  if (isEmpty && !isLoading && emptyState) {
    return (
      <div className="storage-table">
        <div className="storage-table-table-content">{emptyState}</div>
      </div>
    );
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
        {isLoading ? <Loading className={'files-loading-spinner'} /> : rows.map((row, i) => renderRowComponent(row, i))}

        {!isEmpty && (
          <div className="storage-table-footer">
            <div>{!!leftFooterSlot && leftFooterSlot}</div>

            <Pagination
              className="storage-table-pagination"
              page={page}
              totalRowCount={totalRowCount || rows.length}
              itemsPerPage={rowsPerPage}
              visiblePages={1}
              onPageChange={pageSelectHandler}
              scrollTarget={scrollTarget}
            />
            {rowsPerPageOptions && rowsPerPageOptions.length !== 0 && (
              <Dropdown
                className="storage-table-result-dropdown"
                value={rowsPerPage}
                options={rowsPerPageOptions.map(ipp => ({
                  label: `View ${ipp} results`,
                  value: ipp.toString(),
                }))}
                onChange={value => onSetItemsPerPage && onSetItemsPerPage(parseInt(value))}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Table;

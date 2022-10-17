import React, { useCallback } from 'react';

import Loading from 'components/loading/loading';
import Dropdown from 'ZeroComponents/dropdown/dropdown';
// import Pagination from 'components/table/pagination';
import SelectCell from 'components/table/selectCell';
import { ServerPagination } from 'ZeroComponents/pagination/pagination';
import AppData from 'content/pages/app/account.json';

const fileRowLabels = AppData.page_content.file_manager.table.file_row_labels;

/**
 * @typedef {Object} ColumnDefinition
 * @property {string | import('react').ReactComponentElement } headerContent
 * @property {string} id
 * @property {import('react').FC<any>} [cellRenderer]
 * @property {function} [getCellProps]
 */

/**
 * @type {import('react').FC<any>}
 *
 * @param {Object} props
 * @param {ColumnDefinition[]} props.columns
 * @param {Array<object>} props.rows
 * @param {number} [props.totalRowCount]
 * @param {number} [props.page]
 * // The table is currently still using the old pagination, that sets and reads state
 * // from the query params. While it'd be best to have the parent to do that, that's currently outside of scope.
 * // Because of the above we want to make those parameters parameterisable.
 * @param {string} [props.pageQueryParam]
 * @param {string} [props.sizeQueryParam]
 *
 * @param {number} [props.totalRowCount]
 * @param {number} [props.page]
 * @param {number} [props.totalPages]
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
 * @param {(value: any) => void} [props.onDelete]
 */

function Table({
  columns,
  rows,
  totalRowCount,
  page = 0,
  totalPages = 0,
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
  pageQueryParam = 'page',
  sizeQueryParam = 'size',
  onDelete,
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

  const onDeleteHandler = useCallback(
    value => {
      onDelete && onDelete(value);
    },
    [onDelete]
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

  const isRowSelected = row => selectedRows?.includes(rows.indexOf(row));

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
              rows.map(r => rows.indexOf(r))
            )
          }
          id={`table-storage-select-all`}
          onSelectChange={selected => selectAllRowsHandler(selected)}
        />
      ),
      cellRenderer: SelectCell,
      getCellProps: (cell, row) => {
        const index = rows.indexOf(row);

        return {
          selected: selectedRows?.includes(index),
          onSelectChange: selected => selectRowHandler(row, selected),
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
          className={`storage-table__row ${isRowSelected(row) ? 'storage-table__row--active' : ''}`}
          role="row"
          aria-rowindex={index}
          aria-selected={selectedRows?.includes(index) || false}
        >
          {effectiveColumns.map(c => (
            <span key={`${c.id}-${rowKey}`} className="storage-table__cell" role="cell">
              {c.cellRenderer ? (
                <>
                  {c.id !== 'rowSelection' && (
                    <span className="file-row-label medium-down-only">{c.headerContent}</span>
                  )}
                  <c.cellRenderer {...(c.getCellProps ? c.getCellProps(row[c.id], row) : {})}></c.cellRenderer>
                </>
              ) : (
                row[c.id]
              )}
            </span>
          ))}
          <span className={'storage-table__mobile-actions medium-down-only'}>
            <button
              className="storage-table__mobile-delete delete-button"
              onClick={() => {
                onDeleteHandler(row);
              }}
            >
              {fileRowLabels.delete.label}
            </button>
          </span>
        </div>
      </div>
    );
  };

  if (isEmpty && !isLoading && emptyState) {
    return (
      <div className="storage-table">
        <div className="storage-table__content--loading">{emptyState}</div>
      </div>
    );
  }

  return (
    <div className="storage-table" role="table">
      <div role="rowgroup">
        <div className="storage-table__row storage-table__header medium-up-only" role="row">
          {effectiveColumns.map(c => (
            <div key={c.id} role="columnheader">
              {c.headerContent}
            </div>
          ))}
        </div>
      </div>
      <div className="storage-table__content">
        {isLoading ? <Loading className={'files-loading-spinner'} /> : rows.map((row, i) => renderRowComponent(row, i))}

        {!isEmpty && (
          <div className="storage-table__footer">
            <div>{!!leftFooterSlot && leftFooterSlot}</div>
            <ServerPagination
              className="files-manager-pagination"
              itemsPerPage={rowsPerPage}
              visiblePages={1}
              pageCount={totalPages}
              queryParam={pageQueryParam}
              onChange={pageSelectHandler}
              scrollTarget={'.account-files-manager'}
            />
            {/*
            TODO: Use new pagination component and handle query param manipulation in the parent component.
            <Pagination
              className="storage-table__pagination"
              page={page}
              totalRowCount={totalRowCount || rows.length}
              itemsPerPage={rowsPerPage}
              visiblePages={1}
              onPageChange={pageSelectHandler}
              scrollTarget={scrollTarget}
            /> */}
            {rowsPerPageOptions && rowsPerPageOptions.length !== 0 && (
              <Dropdown
                className="storage-table__result-dropdown"
                value={rowsPerPage}
                queryParam={sizeQueryParam}
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

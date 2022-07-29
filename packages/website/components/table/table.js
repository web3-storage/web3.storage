// ===================================================================== Imports

import clsx from 'clsx';
import Loading from 'components/loading/loading';
import filesize from 'filesize';
import React from 'react';
import Dropdown from 'ZeroComponents/dropdown/dropdown';
import Pagination from './pagination';

/**
 * @typedef {Object} ColumnDefinition
 * @property {string} headerContent
 * @property {string} id
 * @property {string} [cellRender]
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
 * @param {import('react').ReactComponentElement}  props.emptyState
 * @param {import('react').ReactComponentElement}  props.dropdown
 * @param {import('react').ReactComponentElement}  props.deleteRowBtn
 * @param {function} props.onPageSelect
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
  dropdown,
  onPageSelect,
  deleteRowBtn,
  scrollTarget,
}) {
  if (isEmpty && !isLoading) {
    return <div className="storage-table-table-content">{emptyState}</div>;
  }

  const getRowComponent = (row, index) => (
    <div role="rowgroup">
      <div className="storage-table-row" role="row" aria-rowindex={index}>
        {columns.map(c => (
          <span key={index} role="cell">
            {row[c.id]}
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <div className="storage-table" role="table">
      <div role="rowgroup">
        <div className="storage-table-row storage-table-header" role="row">
          {columns.map(c => (
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

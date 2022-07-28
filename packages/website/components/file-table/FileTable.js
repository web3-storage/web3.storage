// ===================================================================== Imports

import clsx from 'clsx';
import FileRowItem, { PinStatus } from 'components/account/filesManager/fileRowItem';
import Loading from 'components/loading/loading';
import filesize from 'filesize';
import React from 'react';
import Dropdown from 'ZeroComponents/dropdown/dropdown';
import Pagination from './pagination';

// ====================================================================== Params
/**
 * @param {Object} props
 * @param {import('react').ReactComponentElement[]} props.rows
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
export default function FileTable({
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
    return <div className="files-manager-table-content">{emptyState}</div>;
  }

  return (
    <div className="files-manager-table-content">
      {isLoading ? <Loading className={'files-loading-spinner'} /> : rows.map(row => row)}

      {!isEmpty && (
        <div className="files-manager-footer">
          {deleteRowBtn}

          <Pagination
            className="files-manager-pagination"
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
  );
}

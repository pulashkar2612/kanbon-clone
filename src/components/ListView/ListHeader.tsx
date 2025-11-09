// ListHeader.tsx
import React from 'react';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

interface ListHeaderProps {
  sortBy: string | null;
  sortDirection: 'asc' | 'desc' | null;
  onSortChange: (key: string) => void;
}

const ListHeader: React.FC<ListHeaderProps> = ({ sortBy, sortDirection, onSortChange }) => {
  const toggleSort = (key: string) => {
    onSortChange(key);
  };

  const getSortIcon = (key: string) => {
    if (sortBy === key) {
      return sortDirection === 'asc' ? (
        <FaSortUp className="text-gray-600 dark:text-purple-500" />
      ) : (
        <FaSortDown className="text-gray-600 dark:text-purple-500" />
      );
    }
    return (
      <FaSort className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-purple-400" />
    );
  };

  return (
    <div className="grid grid-cols-5 gap-4 px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-t-lg font-medium text-gray-700 dark:text-gray-100">
      <div
        className="flex items-center space-x-2 cursor-pointer"
        onClick={() => toggleSort('taskName')}
      >
        <span>Task Name</span>
        {getSortIcon('taskName')}
      </div>
      <div
        className="flex items-center space-x-2 cursor-pointer"
        onClick={() => toggleSort('dueOn')}
      >
        <span>Due On</span>
        {getSortIcon('dueOn')}
      </div>
      <div
        className="flex items-center space-x-2 cursor-pointer"
        onClick={() => toggleSort('taskStatus')}
      >
        <span>Task Status</span>
        {getSortIcon('taskStatus')}
      </div>
      <div
        className="flex items-center space-x-2 cursor-pointer"
        onClick={() => toggleSort('taskCategory')}
      >
        <span>Task Category</span>
        {getSortIcon('taskCategory')}
      </div>
      <div>
        <span>Action</span>
      </div>
    </div>
  );
};

export default ListHeader;

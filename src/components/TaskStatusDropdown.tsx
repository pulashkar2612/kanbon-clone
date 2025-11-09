import React, { useState, useRef, useEffect } from 'react';
import { BsListUl } from 'react-icons/bs';

type TaskStatus = 'TO-DO' | 'IN-PROGRESS' | 'COMPLETED';

interface TaskStatusDropdownProps {
  status: TaskStatus;
  onStatusChange: (status: TaskStatus) => void;
}

const TaskStatusDropdown: React.FC<TaskStatusDropdownProps> = ({ status, onStatusChange }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStatusClick = (newStatus: TaskStatus) => {
    onStatusChange(newStatus);
    setIsOpen(false);
  };

  const getStatusDisplay = (statusValue: TaskStatus): string => {
    switch (statusValue) {
      case 'TO-DO':
        return 'To Do';
      case 'IN-PROGRESS':
        return 'In Progress';
      case 'COMPLETED':
        return 'Completed';
      default:
        return statusValue;
    }
  };

  const statusOptions: TaskStatus[] = ['TO-DO', 'IN-PROGRESS', 'COMPLETED'];

  return (
    <div className="space-y-2" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Task Status*
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 border rounded-lg flex justify-between items-center dark:bg-gray-700 dark:text-white"
        >
          {getStatusDisplay(status)}
          <BsListUl />
        </button>
        {isOpen && (
          <div className="absolute bg-white dark:bg-gray-800 border rounded-lg shadow-md w-full mt-2 z-10">
            {statusOptions.map((statusOption) => (
              <button
                key={statusOption}
                type="button"
                onClick={() => handleStatusClick(statusOption)}
                className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-white"
              >
                {getStatusDisplay(statusOption)}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskStatusDropdown;

import React from 'react';
import { Task } from '../../types/tasks';
import { format } from 'date-fns';
import { FaEllipsisV } from 'react-icons/fa';
import { Dropdown, DropdownItem } from '../ui/Dropdown';
import { Button } from '../ui/Button';
import { useDrag } from 'react-dnd';
import parse from 'html-react-parser';

interface TaskCardProps {
  task: Task;
  onUpdate: (updates: Partial<Task>) => void; // Correct prop name to 'onUpdate'
  onDelete: () => void;
  onEdit: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onDelete, onEdit }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'TASK',
    item: { id: task.id, status: task.status },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`bg-white dark:bg-gray-700 rounded-lg shadow-sm p-4 transition-shadow duration-200 cursor-move ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
    >
      {/* Task Title */}
      <div className="flex justify-between items-start mb-3">
        <h3
          className={`font-medium ${task.status === 'COMPLETED' ? 'line-through text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}
        >
          {parse(task.title)} {/* Parse title if it contains HTML */}
        </h3>
        <Dropdown
          trigger={
            <Button
              variant="outline"
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
            >
              <FaEllipsisV className="text-gray-500 dark:text-gray-400" />
            </Button>
          }
        >
          <DropdownItem value="edit" label="Edit" onClick={onEdit} />{' '}
          {/* Use onEdit to open the edit dialog */}
          <DropdownItem
            value="delete"
            label="Delete"
            onClick={onDelete}
            className="text-red-600 dark:text-red-400"
          />
        </Dropdown>
      </div>

      {/* Task Metadata */}
      <div className="flex items-center justify-between text-sm">
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            task.category === 'WORK'
              ? 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
              : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
          }`}
        >
          {task.category}
        </span>

        {task.dueDate && (
          <span className="text-gray-500 dark:text-gray-400">
            {format(new Date(task.dueDate), 'MMM dd, yyyy')}
          </span>
        )}
      </div>
    </div>
  );
};

export default TaskCard;

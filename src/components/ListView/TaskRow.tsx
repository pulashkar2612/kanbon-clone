import React, { useState } from 'react';
import { Task } from '../../types/tasks';
import { format } from 'date-fns';
import { FaEllipsisV, FaCheckCircle, FaClipboardList, FaTasks } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import { Dropdown, DropdownItem } from '../ui/Dropdown';
import { Button } from '../ui/Button';
import 'react-datepicker/dist/react-datepicker.css';
import { Input } from '../ui/Input';
import parse from 'html-react-parser';
import { useDrag } from 'react-dnd';
import TaskEditDialog from '../EditTaskDialog';

interface TaskRowProps {
  task: Task;
  selected: boolean;
  onSelect: (id: string) => void;
  onUpdateTask: (updatedTask: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

const STATUS_OPTIONS = [
  { id: 'TO-DO', name: 'To Do', icon: <FaClipboardList className="text-gray-500" /> },
  { id: 'IN-PROGRESS', name: 'In Progress', icon: <FaCheckCircle className="text-blue-500" /> },
  { id: 'COMPLETED', name: 'Completed', icon: <FaCheckCircle className="text-green-500" /> },
] as const;

const CATEGORY_OPTIONS = [
  { id: 'WORK', name: 'Work', icon: <FaTasks className="text-gray-500" /> },
  { id: 'PERSONAL', name: 'Personal', icon: <FaTasks className="text-purple-500" /> },
] as const;

const TaskRow: React.FC<TaskRowProps> = ({
  task,
  selected,
  onSelect,
  onUpdateTask,
  onDeleteTask,
}) => {
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(task);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleSave = () => {
    onUpdateTask(editedTask);
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDeleteTask(task.id);
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'TO-DO':
        return 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'IN-PROGRESS':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200';
      default:
        return 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

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
      className={`grid grid-cols-5 gap-4 px-4 py-3 border-b dark:border-gray-700 
        ${selected ? 'bg-purple-50 dark:bg-purple-900' : 'bg-white dark:bg-gray-800'} 
        ${isDragging ? 'opacity-50' : 'opacity-100'}
        hover:bg-gray-50 dark:hover:bg-gray-700 cursor-move`}
    >
      {/* Checkbox and Title */}
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelect(task.id)}
          className="w-4 h-4 rounded border-gray-300 text-purple-600 dark:border-gray-600"
        />
        {isEditing ? (
          <Input
            value={editedTask.title}
            onChange={(e) => setEditedTask((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="Task Title"
          />
        ) : (
          <span className={task.status === 'COMPLETED' ? 'line-through text-gray-500' : ''}>
            {parse(task.title)}
          </span>
        )}
      </div>

      {/* Due Date */}
      <div>
        {isEditing ? (
          <DatePicker
            selected={editedTask.dueDate ? new Date(editedTask.dueDate) : null}
            onChange={(date) =>
              setEditedTask((prev) => ({
                ...prev,
                dueDate: date ? date.getTime() : 0, // Convert to timestamp
              }))
            }
            dateFormat="yyyy-MM-dd"
            placeholderText="Select date"
            className="px-3 py-1 border rounded focus:ring-2 focus:ring-purple-500 outline-none w-full bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10"
          />
        ) : (
          <span>
            {task.dueDate ? format(new Date(task.dueDate), 'MMM dd, yyyy') : 'No Due Date'}
          </span>
        )}
      </div>

      {/* Status Dropdown */}
      <div className="relative">
        {isEditing ? (
          <Dropdown
            trigger={
              <Button variant="outline" className="w-full text-left">
                {STATUS_OPTIONS.find((option) => option.id === editedTask.status)?.name}
              </Button>
            }
          >
            {STATUS_OPTIONS.map((option) => (
              <DropdownItem
                key={option.id}
                label={option.name}
                value={option.id}
                selected={option.id === editedTask.status}
                onClick={() => {
                  console.log('Selected Status:', option.id); // Log for debugging
                  const updatedTask = { ...editedTask, status: option.id };
                  setEditedTask(updatedTask); // Update local state
                  onUpdateTask(updatedTask); // Notify parent component about the update
                  setShowStatusMenu(false);
                }}
                icon={option.icon}
              />
            ))}
          </Dropdown>
        ) : (
          <span
            className={`px-2 py-1 rounded-full text-sm ${getStatusColor(task.status)}`}
            onClick={() => setShowStatusMenu((prev) => !prev)} // Toggle showMenu when clicked
          >
            {STATUS_OPTIONS.find((option) => option.id === task.status)?.name}

            {/* Dropdown Menu */}
            {showStatusMenu && (
              <div className="absolute z-10 mt-2 bg-white dark:bg-gray-700 shadow-lg rounded-lg w-48">
                {STATUS_OPTIONS.map((option) => (
                  <DropdownItem
                    key={option.id}
                    label={option.name}
                    value={option.id}
                    selected={option.id === task.status}
                    onClick={() => {
                      console.log('Selected Status:', option.id); // Log for debugging
                      const updatedTask = { ...task, status: option.id };
                      onUpdateTask(updatedTask); // Notify parent component about the update
                      setShowStatusMenu(false); // Close dropdown after selection
                    }}
                    icon={option.icon}
                  />
                ))}
              </div>
            )}
          </span>
        )}
      </div>

      {/* Category Dropdown */}
      <div>
        {isEditing ? (
          <Dropdown
            trigger={
              <Button variant="outline" className="w-full text-left">
                {CATEGORY_OPTIONS.find((option) => option.id === editedTask.category)?.name ||
                  'No Category'}
              </Button>
            }
          >
            {CATEGORY_OPTIONS.map((option) => (
              <DropdownItem
                key={option.id}
                label={option.name}
                value={option.id}
                selected={option.id === editedTask.category}
                onClick={() => {
                  console.log('Selected Category:', option.id); // Log for debugging
                  const updatedTask = { ...editedTask, category: option.id };
                  setEditedTask(updatedTask); // Update local state
                  onUpdateTask(updatedTask); // Notify parent component about the update
                }}
                icon={option.icon}
              />
            ))}
          </Dropdown>
        ) : (
          <span className="text-gray-600 dark:text-gray-400">
            {CATEGORY_OPTIONS.find((option) => option.id === task.category)?.name || 'No Category'}
          </span>
        )}
      </div>

      {/* Actions with Dropdown */}
      <div className="relative">
        {isEditing ? (
          <div className="flex space-x-2">
            <Button onClick={handleSave} variant="secondary">
              Save
            </Button>
            <Button onClick={() => setIsEditing(false)} variant="secondary">
              Cancel
            </Button>
          </div>
        ) : (
          <Dropdown
            trigger={
              <Button
                onClick={() => setShowActionsMenu(!showActionsMenu)}
                variant="ghost"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FaEllipsisV className="text-gray-500 dark:text-gray-400" />
              </Button>
            }
          >
            <DropdownItem value="Edit" label="Edit" onClick={() => setIsEditDialogOpen(true)} />
            <DropdownItem
              value="Delete"
              label="Delete"
              onClick={handleDelete}
              className="text-red-600 dark:text-red-400"
            />
          </Dropdown>
        )}
      </div>
      <TaskEditDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        task={task}
        onUpdateTask={onUpdateTask}
      />
    </div>
  );
};

export default TaskRow;

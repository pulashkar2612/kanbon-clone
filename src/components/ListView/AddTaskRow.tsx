import React, { useState } from 'react';
import { Task } from '../../types/tasks';
import { motion } from 'motion/react';
import { FaPlus } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Button } from '../../components/ui/Button';
import { Dropdown, DropdownItem } from '../../components/ui/Dropdown';
import '../../styles/datepicker.css';
import { Input } from '../ui/Input';
import { useTasks } from '../../hooks/useTask';

const STATUS_OPTIONS = [
  { id: 'TO-DO', name: 'To Do' },
  { id: 'IN-PROGRESS', name: 'In Progress' },
  { id: 'COMPLETED', name: 'Completed' },
] as const;

const CATEGORY_OPTIONS = [
  { id: 'WORK', name: 'Work' },
  { id: 'PERSONAL', name: 'Personal' },
] as const;

interface AddTaskRowProps {
  uid: string; // Add user ID to interact with the correct task list
}

const AddTaskRow: React.FC<AddTaskRowProps> = ({ uid }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTask, setNewTask] = useState<Task>({
    id: '',
    title: '',
    description: '',
    status: STATUS_OPTIONS[0].id,
    category: CATEGORY_OPTIONS[0].id,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    dueDate: undefined,
    imageUrls: [],
  });

  // Access addTask from useTasks hook
  const { addTask, isAddingTask } = useTasks(uid);

  const handleSubmit = async () => {
    if (!newTask.title) return;

    // Prepare the task object to be added, including createdAt and updatedAt
    const taskToAdd: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      status: newTask.status,
      category: newTask.category,
      createdAt: Date.now(), // Add current timestamp for createdAt
      updatedAt: Date.now(), // Add current timestamp for updatedAt
      dueDate: newTask.dueDate ? new Date(newTask.dueDate).getTime() : undefined,
      imageUrls: [],
    };

    // Call addTask to add the task to the database and update the list
    try {
      await addTask(taskToAdd);
      setNewTask({
        id: '',
        title: '',
        dueDate: undefined,
        status: STATUS_OPTIONS[0].id,
        category: CATEGORY_OPTIONS[0].id,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        imageUrls: [],
      });

      setIsAdding(false);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  if (!isAdding) {
    return (
      <div className="border-b py-2">
        <Button
          variant="ghost"
          onClick={() => setIsAdding(true)}
          className="flex items-center space-x-2 text-purple-600 px-4 py-2"
        >
          <FaPlus className="text-sm" />
          <span>ADD TASK</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="border-b py-2">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-5 gap-4 px-4 py-2"
      >
        <Input
          type="text"
          placeholder="Task Title"
          value={newTask.title}
          onChange={(e) => setNewTask((prev) => ({ ...prev, title: e.target.value }))}
          className="px-3 py-1 border rounded focus:ring-2 focus:ring-purple-500 outline-none"
        />

        <DatePicker
          selected={newTask.dueDate ? new Date(newTask.dueDate) : null}
          onChange={(date) =>
            setNewTask((prev) => ({
              ...prev,
              dueDate: date ? date.getTime() : undefined,
            }))
          }
          dateFormat="yyyy-MM-dd"
          placeholderText="Select date"
          className="px-3 py-1 border rounded focus:ring-2 focus:ring-purple-500 outline-none w-full  bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10"
        />

        <Dropdown
          trigger={
            <button className="px-3 py-1 border rounded text-left w-full">
              {STATUS_OPTIONS.find((option) => option.id === newTask.status)?.name}
            </button>
          }
        >
          {STATUS_OPTIONS.map((option) => (
            <DropdownItem
              key={option.id}
              label={option.name}
              value={option.id}
              selected={option.id === newTask.status}
              onClick={() => setNewTask((prev) => ({ ...prev, status: option.id }))}
            />
          ))}
        </Dropdown>

        <Dropdown
          trigger={
            <button className="px-3 py-1 border rounded text-left w-full">
              {CATEGORY_OPTIONS.find((option) => option.id === newTask.category)?.name}
            </button>
          }
        >
          {CATEGORY_OPTIONS.map((option) => (
            <DropdownItem
              key={option.id}
              label={option.name}
              value={option.id}
              selected={option.id === newTask.category}
              onClick={() => setNewTask((prev) => ({ ...prev, category: option.id }))}
            />
          ))}
        </Dropdown>

        <div className="flex space-x-2">
          <Button onClick={handleSubmit} variant="default" disabled={isAddingTask}>
            {isAddingTask ? 'Adding...' : 'Add'}
          </Button>
          <Button onClick={() => setIsAdding(false)} variant="secondary">
            Cancel
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default AddTaskRow;

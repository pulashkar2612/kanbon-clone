import React, { useState } from 'react';
import { Task, TaskStatus } from '../../types/tasks';
import TaskCard from './TaskCard'; // Assuming you have a TaskCard component
import { useDrop } from 'react-dnd';
import TaskEditDialog from '../EditTaskDialog';

interface ColumnProps {
  tasks: Task[];
  status: TaskStatus; // Correcting to TaskStatus
  accentColor: string;
  onUpdateTask: (params: { taskId: string; updates: Partial<Task> }) => void;
  onDeleteTask: (taskId: string) => void;
}

const Column: React.FC<ColumnProps> = ({
  tasks,
  status,
  accentColor,
  onUpdateTask,
  onDeleteTask,
}) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'TASK',
    drop: (item: { id: string; status: TaskStatus }) => {
      if (item.status !== status) {
        onUpdateTask({ taskId: item.id, updates: { status } });
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);

  const handleEditTask = (task: Task) => {
    setCurrentTask(task);
    setIsEditDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsEditDialogOpen(false);
    setCurrentTask(null);
  };

  const handleTaskUpdate = (updatedTask: Task) => {
    if (!currentTask) return; // Prevent updating if no task is selected
    onUpdateTask({ taskId: currentTask.id, updates: updatedTask });
    handleCloseDialog();
  };

  return (
    <div
      ref={drop}
      className={`flex-1 min-h-[600px] bg-gray-50 dark:bg-gray-800 rounded-lg p-4 ${
        isOver ? 'ring-2 ring-purple-500' : ''
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center mb-4">
        <span className={`px-3 py-1 text-sm font-medium rounded-full ${accentColor}`}>
          {status}
        </span>
        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">{tasks.length}</span>
      </div>

      {/* Task Cards */}
      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onUpdate={(updates) => onUpdateTask({ taskId: task.id, updates })}
            onDelete={() => onDeleteTask(task.id)}
            onEdit={() => handleEditTask(task)} // Pass task to be edited
          />
        ))}
      </div>

      {/* Task Edit Dialog */}
      {currentTask && (
        <TaskEditDialog
          isOpen={isEditDialogOpen}
          onClose={handleCloseDialog}
          task={currentTask}
          onUpdateTask={handleTaskUpdate}
        />
      )}
    </div>
  );
};

export default Column;

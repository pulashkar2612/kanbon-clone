import React, { useMemo } from 'react';
import { useTasks } from '../../hooks/useTask';
import Column from './Column';

interface BoardViewProps {
  uid: string; // User ID to fetch tasks,
  filters: { category: string; dueDate: string; searchQuery: string };
}

const BoardView: React.FC<BoardViewProps> = ({ uid, filters }) => {
  const { todoTasks, inProgressTasks, completedTasks, updateTask, deleteTask, isLoading } =
    useTasks(uid);

  const filteredTasks = useMemo(() => {
    let tasks = [...todoTasks, ...inProgressTasks, ...completedTasks];

    // Filter by category
    if (filters.category !== 'all') {
      tasks = tasks.filter((task) => {
        const normalizedTaskCategory = task.category?.toLowerCase() || '';
        const normalizedFilterCategory = filters.category.toLowerCase();
        return normalizedTaskCategory === normalizedFilterCategory; // Compare lowercased values
      });
    }

    // Filter by due date
    if (filters.dueDate === 'today') {
      tasks = tasks.filter(
        (task) => new Date(task.dueDate || '').toDateString() === new Date().toDateString()
      );
    } else if (filters.dueDate === 'this-week') {
      const currentDate = new Date();
      const dayOfWeek = currentDate.getDay(); // 0 (Sunday) to 6 (Saturday)

      // Start of the week: subtracted the day of the week value and got the previous Sunday.
      const weekStart = new Date(currentDate);
      weekStart.setDate(currentDate.getDate() - dayOfWeek);
      weekStart.setHours(0, 0, 0, 0); // Reset to midnight

      // End of the week: Added the days left until Saturday
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999); // End of the day

      tasks = tasks.filter((task) => {
        const taskDueDate = task.dueDate ? new Date(task.dueDate) : null;
        return taskDueDate && taskDueDate >= weekStart && taskDueDate <= weekEnd;
      });
    }

    if (filters.searchQuery) {
      tasks = tasks.filter((task) =>
        task.title.toLowerCase().includes(filters.searchQuery.toLowerCase())
      );
    }

    return tasks;
  }, [todoTasks, inProgressTasks, completedTasks, filters]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-3 gap-6">
        {/* TODO Column */}
        <Column
          tasks={filteredTasks.filter((task) => task.status === 'TO-DO')}
          status="TO-DO"
          accentColor="bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200"
          onUpdateTask={updateTask}
          onDeleteTask={deleteTask}
        />

        {/* IN-PROGRESS Column */}
        <Column
          tasks={filteredTasks.filter((task) => task.status === 'IN-PROGRESS')}
          status="IN-PROGRESS"
          accentColor="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
          onUpdateTask={updateTask}
          onDeleteTask={deleteTask}
        />

        {/* COMPLETED Column */}
        <Column
          tasks={filteredTasks.filter((task) => task.status === 'COMPLETED')}
          status="COMPLETED"
          accentColor="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
          onUpdateTask={updateTask}
          onDeleteTask={deleteTask}
        />
      </div>
    </div>
  );
};

export default BoardView;

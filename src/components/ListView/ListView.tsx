// ListView.tsx
import React, { useMemo, useState } from 'react';
import ListHeader from './ListHeader';
import TaskAccordion from './TaskAccordian';
import AddTaskRow from './AddTaskRow';
import { motion, AnimatePresence } from 'framer-motion';
import TaskRow from './TaskRow';
import { Dropdown, DropdownItem } from '../../components/ui/Dropdown';
import { Button } from '../../components/ui/Button';
import { useTasks } from '../../hooks/useTask';
import { useDrop } from 'react-dnd';
import { Task, TaskStatus } from '../../types/tasks';

interface TaskSectionProps {
  status: TaskStatus;
  tasks: Task[];
  isExpanded: boolean;
  onToggle: () => void;
  accentColor: string;
  selectedTasks: string[];
  setSelectedTasks: React.Dispatch<React.SetStateAction<string[]>>;
  updateTask: (params: { taskId: string; updates: Partial<Task> }) => void;
  deleteTask: (taskId: string) => void;
  bulkUpdateTasks: (params: { taskIds: string[]; updates: Partial<Task> }) => void;
  children?: React.ReactNode;
}

const TaskSection: React.FC<TaskSectionProps> = ({
  status,
  tasks,
  isExpanded,
  onToggle,
  accentColor,
  selectedTasks,
  setSelectedTasks,
  updateTask,
  deleteTask,
  bulkUpdateTasks,
  children,
}) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'TASK',
    drop: (item: { id: string; status: TaskStatus }) => {
      if (item.status !== status) {
        bulkUpdateTasks({
          taskIds: [item.id],
          updates: { status },
        });
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      className={`${isOver ? 'bg-purple-50 dark:bg-purple-900' : ''} transition-colors duration-200`}
    >
      <TaskAccordion
        title={status === 'TO-DO' ? 'Todo' : status === 'IN-PROGRESS' ? 'In Progress' : 'Completed'}
        count={tasks.length}
        isExpanded={isExpanded}
        onToggle={onToggle}
        accentColor={accentColor}
      >
        {children}
        {tasks.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            selected={selectedTasks.includes(task.id)}
            onSelect={(id) => {
              setSelectedTasks((prev) =>
                prev.includes(id) ? prev.filter((taskId) => taskId !== id) : [...prev, id]
              );
            }}
            onUpdateTask={(updates) => updateTask({ taskId: task.id, updates })}
            onDeleteTask={() => deleteTask(task.id)}
          />
        ))}
      </TaskAccordion>
    </div>
  );
};

interface ListViewProps {
  uid: string;
  filters: { category: string; dueDate: string; searchQuery: string };
}

const ListView: React.FC<ListViewProps> = ({ uid, filters }) => {
  const {
    todoTasks,
    inProgressTasks,
    completedTasks,
    updateTask,
    deleteTask,
    bulkUpdateTasks,
    bulkDeleteTasks,
    isLoading,
  } = useTasks(uid);

  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    TODO: true,
    'IN-PROGRESS': false,
    COMPLETED: false,
  });

  // Add sorting state
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleSortChange = (key: string) => {
    if (sortBy === key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortBy(null);
        setSortDirection(null);
      }
    } else {
      setSortBy(key);
      setSortDirection('asc');
    }
  };

  const handleChangeStatus = (status: TaskStatus) => {
    bulkUpdateTasks({ taskIds: selectedTasks, updates: { status } });
    setSelectedTasks([]);
  };

  const handleDelete = async () => {
    bulkDeleteTasks(selectedTasks);
    setSelectedTasks([]);
  };

  // Combined filtering and sorting logic
  const filteredAndSortedTasks = useMemo(() => {
    let tasks = [...todoTasks, ...inProgressTasks, ...completedTasks];

    // Apply existing filters
    if (filters.category !== 'all') {
      tasks = tasks.filter((task) => {
        const normalizedTaskCategory = task.category?.toLowerCase() || '';
        const normalizedFilterCategory = filters.category.toLowerCase();
        return normalizedTaskCategory === normalizedFilterCategory;
      });
    }

    if (filters.dueDate === 'today') {
      tasks = tasks.filter(
        (task) => new Date(task.dueDate || '').toDateString() === new Date().toDateString()
      );
    } else if (filters.dueDate === 'this-week') {
      const currentDate = new Date();
      const dayOfWeek = currentDate.getDay();
      const weekStart = new Date(currentDate);
      weekStart.setDate(currentDate.getDate() - dayOfWeek);
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

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

    // Apply sorting after filtering
    if (sortBy && sortDirection) {
      tasks.sort((a, b) => {
        let compareA, compareB;

        switch (sortBy) {
          case 'taskName':
            compareA = a.title.toLowerCase();
            compareB = b.title.toLowerCase();
            break;
          case 'dueOn':
            compareA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
            compareB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
            break;
          case 'taskStatus':
            compareA = a.status;
            compareB = b.status;
            break;
          case 'taskCategory':
            compareA = (a.category || '').toLowerCase();
            compareB = (b.category || '').toLowerCase();
            break;
          default:
            return 0;
        }

        if (compareA < compareB) return sortDirection === 'asc' ? -1 : 1;
        if (compareA > compareB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return tasks;
  }, [todoTasks, inProgressTasks, completedTasks, filters, sortBy, sortDirection]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <ListHeader sortBy={sortBy} sortDirection={sortDirection} onSortChange={handleSortChange} />

      <TaskSection
        status="TO-DO"
        tasks={filteredAndSortedTasks.filter((task) => task.status === 'TO-DO')}
        isExpanded={expandedSections.TODO}
        onToggle={() => toggleSection('TODO')}
        accentColor="bg-indigo-200 dark:bg-indigo-800"
        selectedTasks={selectedTasks}
        setSelectedTasks={setSelectedTasks}
        updateTask={updateTask}
        deleteTask={deleteTask}
        bulkUpdateTasks={bulkUpdateTasks}
      >
        <AddTaskRow uid={uid} />
      </TaskSection>

      <TaskSection
        status="IN-PROGRESS"
        tasks={filteredAndSortedTasks.filter((task) => task.status === 'IN-PROGRESS')}
        isExpanded={expandedSections['IN-PROGRESS']}
        onToggle={() => toggleSection('IN-PROGRESS')}
        accentColor="bg-teal-200 dark:bg-teal-800"
        selectedTasks={selectedTasks}
        setSelectedTasks={setSelectedTasks}
        updateTask={updateTask}
        deleteTask={deleteTask}
        bulkUpdateTasks={bulkUpdateTasks}
      />

      <TaskSection
        status="COMPLETED"
        tasks={filteredAndSortedTasks.filter((task) => task.status === 'COMPLETED')}
        isExpanded={expandedSections.COMPLETED}
        onToggle={() => toggleSection('COMPLETED')}
        accentColor="bg-lime-200 dark:bg-lime-800"
        selectedTasks={selectedTasks}
        setSelectedTasks={setSelectedTasks}
        updateTask={updateTask}
        deleteTask={deleteTask}
        bulkUpdateTasks={bulkUpdateTasks}
      />

      <AnimatePresence>
        {selectedTasks.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 shadow-lg rounded-lg px-6 py-3 flex items-center space-x-4"
          >
            <span>{selectedTasks.length} tasks selected</span>

            <Dropdown
              trigger={
                <Button variant="outline" className="px-3 py-1 rounded text-left">
                  Change Status
                </Button>
              }
            >
              <DropdownItem
                label="To Do"
                value="TO-DO"
                onClick={() => handleChangeStatus('TO-DO')}
              />
              <DropdownItem
                label="In Progress"
                value="IN-PROGRESS"
                onClick={() => handleChangeStatus('IN-PROGRESS')}
              />
              <DropdownItem
                label="Completed"
                value="COMPLETED"
                onClick={() => handleChangeStatus('COMPLETED')}
              />
            </Dropdown>

            <Button onClick={handleDelete} variant="ghost" className="text-red-500">
              Delete
            </Button>

            <Button
              onClick={() => setSelectedTasks([])}
              variant="ghost"
              className="text-gray-500 dark:text-gray-300"
            >
              Cancel
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ListView;

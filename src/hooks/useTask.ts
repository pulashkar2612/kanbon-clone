// src/hooks/useTasks.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTasks, addTask, updateTask, deleteTask } from '../firebase/taskStorage';
import { Task, TaskStatus, TaskMutationParams, BulkUpdateParams } from '../types/tasks';

export function useTasks(uid: string | undefined) {
  const queryClient = useQueryClient();

  // Query for fetching all tasks
  const {
    data: tasks = [],
    isLoading,
    error,
  } = useQuery<Task[]>({
    queryKey: ['tasks', uid],
    queryFn: () => (uid ? getTasks(uid) : Promise.resolve([])),
    enabled: !!uid,
  });

  // Add task mutation
  const addTaskMutation = useMutation<Task, Error, Task>({
    mutationFn: async (newTask) => {
      if (!uid) throw new Error('No user ID provided');
      await addTask(uid, newTask);
      return newTask;
    },
    onSuccess: (newTask) => {
      queryClient.setQueryData<Task[]>(['tasks', uid], (oldTasks = []) => [...oldTasks, newTask]);
    },
  });

  // Update task mutation
  const updateTaskMutation = useMutation<Task, Error, TaskMutationParams>({
    mutationFn: async ({ taskId, updates }) => {
      if (!uid) throw new Error('No user ID provided');
      await updateTask(uid, taskId, updates);
      const updatedTask = tasks.find((t) => t.id === taskId);
      return { ...updatedTask!, ...updates } as Task;
    },
    onSuccess: (updatedTask) => {
      queryClient.setQueryData<Task[]>(['tasks', uid], (oldTasks = []) =>
        oldTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
      );
    },
  });

  // Bulk update tasks mutation
  const bulkUpdateTasksMutation = useMutation<Task[], Error, BulkUpdateParams>({
    mutationFn: async ({ taskIds, updates }) => {
      if (!uid) throw new Error('No user ID provided');
      const updatePromises = taskIds.map((taskId) => updateTask(uid, taskId, updates));
      await Promise.all(updatePromises);
      const updatedTasks = tasks
        .filter((task) => taskIds.includes(task.id))
        .map((task) => ({ ...task, ...updates }));
      return updatedTasks;
    },
    onSuccess: (updatedTasks) => {
      queryClient.setQueryData<Task[]>(['tasks', uid], (oldTasks = []) =>
        oldTasks.map((task) => {
          const updatedTask = updatedTasks.find((t) => t.id === task.id);
          return updatedTask || task;
        })
      );
    },
  });

  // Bulk delete tasks mutation
  const bulkDeleteTasksMutation = useMutation<string[], Error, string[]>({
    mutationFn: async (taskIds) => {
      if (!uid) throw new Error('No user ID provided');
      const deletePromises = taskIds.map((taskId) => deleteTask(uid, taskId));
      await Promise.all(deletePromises);
      return taskIds;
    },
    onSuccess: (taskIds) => {
      queryClient.setQueryData<Task[]>(['tasks', uid], (oldTasks = []) =>
        oldTasks.filter((task) => !taskIds.includes(task.id))
      );
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation<string, Error, string>({
    mutationFn: async (taskId) => {
      if (!uid) throw new Error('No user ID provided');
      await deleteTask(uid, taskId);
      return taskId;
    },
    onSuccess: (taskId) => {
      queryClient.setQueryData<Task[]>(['tasks', uid], (oldTasks = []) =>
        oldTasks.filter((task) => task.id !== taskId)
      );
    },
  });

  // Filter tasks by status
  const getTasksByStatusQuery = (status: TaskStatus) =>
    tasks.filter((task) => task.status === status);

  return {
    tasks,
    isLoading,
    error,
    todoTasks: getTasksByStatusQuery('TO-DO'),
    inProgressTasks: getTasksByStatusQuery('IN-PROGRESS'),
    completedTasks: getTasksByStatusQuery('COMPLETED'),
    addTask: addTaskMutation.mutate,
    updateTask: updateTaskMutation.mutate,
    deleteTask: deleteTaskMutation.mutate,
    bulkUpdateTasks: bulkUpdateTasksMutation.mutate,
    bulkDeleteTasks: bulkDeleteTasksMutation.mutate,
    isAddingTask: addTaskMutation.isPending,
    isUpdatingTask: updateTaskMutation.isPending,
    isDeletingTask: deleteTaskMutation.isPending,
    isBulkDeletingTask: bulkDeleteTasksMutation.isPending,
    isBulkUpdating: bulkUpdateTasksMutation.isPending,
  };
}

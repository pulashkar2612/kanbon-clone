// src/types/tasks.ts

export type TaskStatus = 'TO-DO' | 'IN-PROGRESS' | 'COMPLETED';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  createdAt: number;
  updatedAt: number;
  dueDate?: number;
  category: 'WORK' | 'PERSONAL';
  imageUrls: string[];
}

// Component Props Types
export interface TaskRowProps {
  task: Task;
  selected: boolean;
  onSelect: (id: string) => void;
  onUpdateTask: (updates: Partial<Task>) => void;
}

export interface AddTaskRowProps {
  onAddTask: (task: Task) => void;
}

// Hook Types
export interface TaskMutationParams {
  taskId: string;
  updates: Partial<Task>;
}

export interface BulkUpdateParams {
  taskIds: string[];
  updates: Partial<Task>;
}

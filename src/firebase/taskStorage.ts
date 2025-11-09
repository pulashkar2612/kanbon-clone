// src/lib/taskStorage.ts
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
  Timestamp,
  getDoc,
  Firestore,
} from 'firebase/firestore';
import { db } from './firebase';
import { Task } from '../types/tasks';
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
  S3ServiceException,
} from '@aws-sdk/client-s3';

const S3_BUCKET = 'kanban-aws';
const REGION = 'ap-south-1';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// AWS Client setup
const AWS_CLIENT = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
  },
});

// Improved helper function with validation
async function uploadImageToS3(file: File, userId: string): Promise<string> {
  console.log('Starting image upload to S3:', {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
  });

  // Validate file size and type
  if (file.size > MAX_FILE_SIZE) {
    console.error('File size validation failed:', { fileSize: file.size, maxSize: MAX_FILE_SIZE });
    throw new Error('File size exceeds 5MB limit');
  }
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    console.error('File type validation failed:', {
      fileType: file.type,
      allowedTypes: ALLOWED_FILE_TYPES,
    });
    throw new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed');
  }

  const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(2)}-${file.name}`;
  const params = {
    Bucket: S3_BUCKET,
    Key: `public/${fileName}`,
    Body: file,
    ContentType: file.type,
  };

  try {
    console.log('Sending upload command to S3:', { bucket: S3_BUCKET, key: params.Key });
    await AWS_CLIENT.send(new PutObjectCommand(params));
    const fileUrl = `https://${S3_BUCKET}.s3.${REGION}.amazonaws.com/public/${fileName}`;
    console.log('Upload successful:', { fileUrl });
    return fileUrl;
  } catch (error) {
    console.error('AWS S3 upload error:', error);
    if (error instanceof S3ServiceException) {
      throw new Error(`Upload failed: ${error.message}`);
    }
    throw new Error('Upload failed: Unknown error occurred');
  }
}

// Improved delete helper with proper error handling
async function deleteImageFromS3(imageUrl: string): Promise<void> {
  console.log('Starting image deletion from S3:', { imageUrl });

  if (!imageUrl) {
    console.log('No image URL provided, skipping deletion');
    return;
  }

  try {
    const urlParts = imageUrl.split(`${S3_BUCKET}.s3.${REGION}.amazonaws.com/`);
    if (urlParts.length !== 2) {
      console.error('Invalid S3 URL format');
      return;
    }

    const filePath = urlParts[1];
    const params = {
      Bucket: S3_BUCKET,
      Key: filePath,
    };

    console.log('Sending delete command to S3:', { bucket: S3_BUCKET, key: params.Key });
    await AWS_CLIENT.send(new DeleteObjectCommand(params));
    console.log('Image deleted successfully');
  } catch (error) {
    console.error('Error deleting image from S3:', error);
    if (error instanceof S3ServiceException) {
      throw new Error(`Failed to delete image: ${error.message}`);
    }
    throw new Error('Failed to delete image: Unknown error occurred');
  }
}

// Helper function to get task collection reference
const getTasksCollection = (db: Firestore, uid: string) => {
  return collection(doc(db, 'users', uid), 'tasks');
};

// Task operations with AWS S3 integration
export const addTask = async (uid: string, task: Task, files?: File[]): Promise<void> => {
  console.log('Adding new task:', { uid, taskId: task.id, filesCount: files?.length });

  // Check if task.id is properly defined
  if (!uid || !task.id) {
    console.error('Invalid input parameters:', { uid, taskId: task.id });
    throw new Error('Invalid user ID or task ID');
  }

  try {
    const imageUrls: string[] = [];
    if (files?.length) {
      console.log('Processing files for upload');
      await Promise.all(
        files.map(async (file) => {
          try {
            const url = await uploadImageToS3(file, uid);
            imageUrls.push(url);
          } catch (error) {
            console.error(`Failed to upload image: ${file.name}`, error);
          }
        })
      );
    }

    const taskRef = doc(getTasksCollection(db, uid), task.id);
    const taskData = {
      ...task,
      imageUrls: imageUrls,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    console.log('Saving task to Firestore:', taskData);
    await setDoc(taskRef, taskData);
    console.log('Task added successfully');
  } catch (error) {
    console.error('Error adding task:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to add task: ${error.message}`);
    }
    throw new Error('Failed to add task: Unknown error occurred');
  }
};

export const updateTask = async (
  uid: string,
  taskId: string,
  updates: Partial<Task>,
  newFiles?: File[],
  deletedImageUrls?: string[]
): Promise<void> => {
  console.log('Updating task:', {
    uid,
    taskId,
    updatesKeys: Object.keys(updates),
    newFilesCount: newFiles?.length,
    deletedUrlsCount: deletedImageUrls?.length,
  });

  if (!uid || !taskId) {
    console.error('Invalid input parameters:', { uid, taskId });
    throw new Error('Invalid user ID or task ID');
  }

  const taskRef = doc(getTasksCollection(db, uid), taskId);

  try {
    const taskDoc = await getDoc(taskRef);
    if (!taskDoc.exists()) {
      console.error('Task not found:', { taskId });
      throw new Error('Task not found');
    }

    const existingTask = taskDoc.data() as Task;
    console.log('Existing task data:', existingTask);

    // Handle image deletions
    if (deletedImageUrls?.length) {
      console.log('Processing image deletions');
      await Promise.all(deletedImageUrls.map(deleteImageFromS3));
    }

    // Handle new images
    const newImageUrls: string[] = [];
    if (newFiles?.length) {
      console.log('Processing new file uploads');
      await Promise.all(
        newFiles.map(async (file) => {
          try {
            const url = await uploadImageToS3(file, uid);
            newImageUrls.push(url);
          } catch (error) {
            console.error(`Failed to upload image: ${file.name}`, error);
          }
        })
      );
    }

    // Combine existing and new image URLs
    // Update this part
    const currentImageUrls = [
      ...(updates.imageUrls || existingTask.imageUrls || []),
      ...newImageUrls,
    ];

    const updatedData = {
      ...updates,
      imageUrls: currentImageUrls,
      updatedAt: Timestamp.now(),
    };

    console.log('Updating task in Firestore:', updatedData);
    await updateDoc(taskRef, updatedData);
    console.log('Task updated successfully');
  } catch (error) {
    console.error('Error updating task:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to update task: ${error.message}`);
    }
    throw new Error('Failed to update task: Unknown error occurred');
  }
};

export const deleteTask = async (uid: string, taskId: string): Promise<void> => {
  console.log('Deleting task:', { uid, taskId });

  try {
    // Get the task document directly instead of querying the collection
    const taskRef = doc(getTasksCollection(db, uid), taskId);
    const taskDoc = await getDoc(taskRef);

    if (!taskDoc.exists()) {
      console.error('Task not found:', { taskId });
      throw new Error('Task not found');
    }

    const task = taskDoc.data() as Task;

    // Type guard to ensure imageUrls contains only strings
    const imageUrls = task.imageUrls?.filter((url): url is string => typeof url === 'string');

    if (imageUrls && imageUrls.length > 0) {
      console.log('Deleting associated images:', { imageCount: imageUrls.length });
      await Promise.all(imageUrls.map((url) => deleteImageFromS3(url)));
    }

    console.log('Deleting task from Firestore');
    await deleteDoc(taskRef);
    console.log('Task and associated images deleted successfully');
  } catch (error) {
    console.error('Error deleting task and images:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to delete task: ${error.message}`);
    }
    throw new Error('Failed to delete task: Unknown error occurred');
  }
};

// Existing query functions remain the same since they don't involve file storage
export const getTasks = async (uid: string): Promise<Task[]> => {
  console.log('Fetching all tasks for user:', uid);
  try {
    const tasksRef = collection(doc(db, 'users', uid), 'tasks');
    const snapshot = await getDocs(tasksRef);
    const tasks = snapshot.docs.map((doc) => doc.data() as Task);
    console.log('Tasks fetched successfully:', { count: tasks.length });
    return tasks;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
};

export const getTasksByStatus = async (uid: string, status: string): Promise<Task[]> => {
  console.log('Fetching tasks by status:', { uid, status });
  try {
    const tasksRef = collection(doc(db, 'users', uid), 'tasks');
    const q = query(tasksRef, where('status', '==', status));
    const snapshot = await getDocs(q);
    const tasks = snapshot.docs.map((doc) => doc.data() as Task);
    console.log('Tasks fetched successfully:', { count: tasks.length });
    return tasks;
  } catch (error) {
    console.error('Error fetching tasks by status:', error);
    return [];
  }
};

export const getFilteredTasks = async (
  uid: string,
  filters: {
    category?: string;
    dueDate?: string;
    searchQuery?: string;
  }
): Promise<Task[]> => {
  console.log('Fetching filtered tasks:', { uid, filters });
  try {
    const tasksRef = collection(doc(db, 'users', uid), 'tasks');
    let taskQuery = query(tasksRef);

    if (filters.category && filters.category !== 'all') {
      taskQuery = query(taskQuery, where('category', '==', filters.category.toUpperCase()));
    }

    if (filters.dueDate && filters.dueDate !== 'all') {
      const today = new Date();
      const startOfToday = Timestamp.fromDate(
        new Date(today.getFullYear(), today.getMonth(), today.getDate())
      );
      const startOfTomorrow = Timestamp.fromDate(
        new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
      );
      const endOfWeek = Timestamp.fromDate(
        new Date(today.getFullYear(), today.getMonth(), today.getDate() + (7 - today.getDay()))
      );

      if (filters.dueDate === 'today') {
        taskQuery = query(
          taskQuery,
          where('dueDate', '>=', startOfToday),
          where('dueDate', '<', startOfTomorrow)
        );
      } else if (filters.dueDate === 'tomorrow') {
        taskQuery = query(
          taskQuery,
          where('dueDate', '>=', startOfTomorrow),
          where('dueDate', '<', Timestamp.fromMillis(startOfTomorrow.toMillis() + 86400000))
        );
      } else if (filters.dueDate === 'this-week') {
        taskQuery = query(
          taskQuery,
          where('dueDate', '>=', startOfToday),
          where('dueDate', '<=', endOfWeek)
        );
      }
    }

    const snapshot = await getDocs(taskQuery);
    const tasks = snapshot.docs.map((doc) => doc.data() as Task);
    console.log('Filtered tasks fetched successfully:', { count: tasks.length });
    return tasks;
  } catch (error) {
    console.error('Error fetching filtered tasks:', error);
    return [];
  }
};

import React, { useState, useEffect } from 'react';
import { Dialog, DialogBackdrop } from '@headlessui/react';
import { useDropzone } from 'react-dropzone';
import { format } from 'date-fns';
import { IoClose } from 'react-icons/io5';
import { Editor } from '@tinymce/tinymce-react'; // Import TinyMCE editor
import type { Task, TaskStatus } from '../types/tasks';
import { removeFile, uploadFile } from '../aws/aws-sdk';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import TaskStatusDropdown from './TaskStatusDropdown';
interface TaskEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  onUpdateTask: (task: Task) => void;
}

const key = import.meta.env.VITE_TINTMCE_API_KEY;

const TaskEditDialog: React.FC<TaskEditDialogProps> = ({ isOpen, onClose, task, onUpdateTask }) => {
  if (!task) {
    return null; // Don't render the dialog if task is null or undefined
  }
  const [formData, setFormData] = useState<{
    title: string;
    category: 'WORK' | 'PERSONAL';
    dueDate: Date;
    status: TaskStatus;
  }>({
    title: task.title,
    category: task.category,
    dueDate: new Date(task.dueDate ?? Date.now()),
    status: task.status,
  });

  // Initialize filePreviews with existing images from task
  const [filePreviews, setFilePreviews] = useState<(string | File)[]>(task.imageUrls || []);

  useEffect(() => {
    setFilePreviews(task.imageUrls || []);
  }, [task]);

  const { getRootProps, getInputProps } = useDropzone({
    maxFiles: 5,
    maxSize: 5242880, // 5MB
    onDrop: async (files) => {
      try {
        // Show loading state or progress indicator if needed
        console.log('Processing files:', files.length);

        const uploadPromises = files.map(async (file) => {
          console.log('Uploading file:', file.name);
          try {
            const url = await uploadFile(file);
            console.log('Upload result:', { fileName: file.name, url });
            return url;
          } catch (error) {
            console.error('Error uploading file:', file.name, error);
            return null;
          }
        });

        const uploadedFileUrls = await Promise.all(uploadPromises);

        // Filter out null results and update the state
        const validUrls = uploadedFileUrls.filter((url): url is string => url !== null);
        console.log('Successfully uploaded files:', validUrls.length);

        setFilePreviews((prev) => [...prev, ...validUrls]);
        const updatedTask: Task = {
          ...task,
          imageUrls: [...(task.imageUrls || []), ...validUrls],
          updatedAt: Date.now(),
        };
        onUpdateTask(updatedTask);
      } catch (error) {
        console.error('Error in file upload process:', error);
        // Handle error - show error message to user
      }
    },
  });

  useEffect(() => {
    return () => {
      filePreviews.forEach((file) => {
        if (typeof file === 'string' && file.startsWith('blob:')) {
          URL.revokeObjectURL(file);
        }
      });
    };
  }, [filePreviews]);

  useEffect(() => {
    return () => {
      filePreviews.forEach((file) => {
        if (typeof file === 'string' && file.startsWith('blob:')) {
          URL.revokeObjectURL(file);
        }
      });
    };
  }, [filePreviews]);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return isNaN(date.getTime()) ? 'Invalid date' : format(date, 'MMM dd, yyyy HH:mm:ss');
  };

  const handleCancel = () => {
    setFilePreviews([]); // Clear file previews when canceled
    onClose(); // Close the dialog
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedTask: Task = {
      ...task,
      ...formData,
      dueDate: formData.dueDate.getTime(),
      updatedAt: Date.now(),
      imageUrls: task.imageUrls || [],
    };
    const newImageUrls = filePreviews
      .filter((preview): preview is string => typeof preview === 'string')
      .filter((url) => !task.imageUrls?.includes(url));

    if (newImageUrls.length > 0) {
      updatedTask.imageUrls = [...(updatedTask.imageUrls || []), ...newImageUrls];
    }

    onUpdateTask(updatedTask);
    onClose();
  };

  const handleRemoveFile = async (fileUrl: string) => {
    await removeFile(fileUrl, setFilePreviews);

    // Filter out any non-string values from filePreviews before updating imageUrls
    const updatedImageUrls = filePreviews
      .filter((url) => typeof url === 'string') // Only keep strings
      .filter((url) => url !== fileUrl); // Remove the fileUrl

    const updatedTask: Task = {
      ...task,
      imageUrls: updatedImageUrls, // Ensure imageUrls only contains strings
      updatedAt: Date.now(),
    };

    onUpdateTask(updatedTask);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto ">
        <div className="flex min-h-screen items-center justify-center p-4">
          <DialogBackdrop className="fixed inset-0 bg-black/30 dark:bg-black/80" />
          <div className="relative bg-white dark:bg-gray-800 rounded-lg w-full max-w-3xl shadow-xl overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-600">
              <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
                Edit Task
              </Dialog.Title>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                aria-label="Close dialog"
              >
                <IoClose size={24} />
              </button>
            </div>

            <div className="flex">
              <div className="flex-1 p-6 overflow-y-auto content-div">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* TinyMCE Editor */}
                  <div className="space-y-2">
                    <Editor
                      apiKey={key}
                      init={{
                        height: 200,
                        menubar: false,
                        plugins: [
                          'advlist',
                          'autolink',
                          'lists',
                          'link',
                          'image',
                          'charmap',
                          'preview',
                          'anchor',
                        ],
                        toolbar:
                          'undo redo | bold italic underline | formatselect | bullist numlist outdent indent | link image',
                        forced_root_block: '',
                      }}
                      value={formData.title}
                      onEditorChange={(content) =>
                        setFormData((prev) => ({ ...prev, title: content }))
                      }
                    />
                  </div>
                  {/* Category Selection */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Task Category*
                    </label>
                    <div className="flex gap-3">
                      {['WORK', 'PERSONAL'].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              category: cat as 'WORK' | 'PERSONAL',
                            }))
                          }
                          className={`px-4 py-2 rounded-full ${formData.category === cat ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-white'}`}
                        >
                          {cat.charAt(0) + cat.slice(1).toLowerCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Due Date and Status Inputs */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Due on*
                      </label>
                      <input
                        type="date"
                        value={format(formData.dueDate, 'yyyy-MM-dd')}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, dueDate: new Date(e.target.value) }))
                        }
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        required
                      />
                    </div>

                    {/* Custom Dropdown for Task Status */}
                    <TaskStatusDropdown
                      status={formData.status}
                      onStatusChange={(newStatus) =>
                        setFormData((prev) => ({ ...prev, status: newStatus }))
                      }
                    />
                  </div>
                  {/* File Upload */}
                  <div
                    {...getRootProps()}
                    className="border-2 border-dashed rounded-lg p-4 cursor-pointer dark:border-gray-600"
                  >
                    <input {...getInputProps()} />
                    <p className="text-center text-gray-500 dark:text-gray-400">
                      Drop files here or click to upload (max 5 files, 5MB each)
                    </p>
                  </div>
                  {/* File Previews */}
                  {filePreviews.length > 0 && (
                    <div className="mt-4 space-y-4">
                      {filePreviews.map((file, index) => {
                        const fileUrl = typeof file === 'string' ? file : URL.createObjectURL(file);
                        const isImage =
                          fileUrl.startsWith('blob:') || /\.(jpg|jpeg|png|gif)$/i.test(fileUrl);

                        return (
                          <div key={index} className="relative flex items-center gap-4">
                            {isImage ? (
                              <img
                                src={fileUrl}
                                alt={`file-preview-${index}`}
                                className="w-full h-auto object-cover rounded-md"
                              />
                            ) : (
                              <div className="text-sm text-gray-500 dark:text-gray-300">
                                {/* If not an image, display the file name */}
                                {(file as File).name}
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveFile(fileUrl)}
                              className="absolute top-0 right-0 bg-purple-500 rounded-md m-2 border-gray-100 border-2 hover:bg-purple-700 hover:outline-purple-700 hover:outline-2"
                            >
                              <IoClose size={26} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Submit and Cancel Buttons */}
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 dark:bg-purple-800 dark:hover:bg-purple-700"
                    >
                      Update
                    </button>
                  </div>
                </form>
              </div>

              {/* Activity Sidebar */}
              <div className="w-72 border-l p-4 bg-gray-50 dark:bg-gray-700">
                <h3 className="font-medium mb-4 text-gray-900 dark:text-white">Activity</h3>
                <div className="space-y-4">
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    <p>Task created</p>
                    <p className="text-gray-400 dark:text-gray-500">{formatDate(task.createdAt)}</p>
                  </div>
                  {task.updatedAt !== task.createdAt && (
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      <p>Task updated</p>
                      <p className="text-gray-400 dark:text-gray-500">
                        {formatDate(task.updatedAt)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Dialog>
    </DndProvider>
  );
};

export default TaskEditDialog;

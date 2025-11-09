import React, { useEffect, useState } from 'react';
import { Dialog, DialogBackdrop } from '@headlessui/react';
import { useDropzone } from 'react-dropzone';
import { format } from 'date-fns';
import { IoClose } from 'react-icons/io5';
import { Editor } from '@tinymce/tinymce-react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import TaskStatusDropdown from './TaskStatusDropdown';
import { useTasks } from '../hooks/useTask';
import { uploadFile } from '../aws/aws-sdk';

interface CreateTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  uid: string | undefined;
}

const CreateTaskDialog: React.FC<CreateTaskDialogProps> = ({ isOpen, onClose, uid }) => {
  const { addTask, isAddingTask } = useTasks(uid);

  const [formData, setFormData] = useState({
    title: '',
    category: 'WORK' as 'WORK' | 'PERSONAL',
    dueDate: new Date(),
    status: 'TO-DO' as 'TO-DO' | 'IN-PROGRESS' | 'COMPLETED',
  });

  const [filePreviews, setFilePreviews] = useState<string[]>([]);

  const { getRootProps, getInputProps } = useDropzone({
    maxFiles: 5,
    maxSize: 5242880, // 5MB
    onDrop: async (files) => {
      try {
        const uploadPromises = files.map(async (file) => {
          try {
            const url = await uploadFile(file);
            return url;
          } catch (error) {
            console.error('Error uploading file:', file.name, error);
            return null;
          }
        });

        const uploadedFileUrls = await Promise.all(uploadPromises);
        const validUrls = uploadedFileUrls.filter((url): url is string => url !== null);
        setFilePreviews((prev) => [...prev, ...validUrls]);
      } catch (error) {
        console.error('Error in file upload process:', error);
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newTask = {
      id: Date.now().toString(),
      title: formData.title,
      status: formData.status,
      category: formData.category,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      imageUrls: filePreviews,
    };

    try {
      await addTask(newTask);
      onClose();
      // Clear the form after submission
      setFormData({
        title: '',
        category: 'WORK',
        dueDate: new Date(),
        status: 'TO-DO',
      });
      setFilePreviews([]); // Clear file previews
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleCancel = () => {
    setFilePreviews([]); // Clear file previews when canceled
    onClose(); // Close the dialog
  };
  useEffect(() => {
    return () => {
      filePreviews.forEach((file) => {
        if (typeof file === 'string' && file.startsWith('blob:')) {
          URL.revokeObjectURL(file);
        }
      });
    };
  }, [filePreviews]);
  return (
    <DndProvider backend={HTML5Backend}>
      <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          <DialogBackdrop className="fixed inset-0 bg-black/30 dark:bg-black/80" />
          <div className="relative bg-white dark:bg-gray-800 rounded-lg w-full max-w-3xl shadow-xl overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-600">
              <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
                Create New Task
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
              <div className="flex-1 p-6 overflow-y-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Editor
                      apiKey={import.meta.env.VITE_TINTMCE_API_KEY}
                      init={{
                        height: 200,
                        menubar: false,
                        plugins: ['advlist', 'autolink', 'lists', 'link', 'image', 'preview'],
                        toolbar: 'undo redo | bold italic | formatselect | bullist numlist | link',
                      }}
                      value={formData.title}
                      onEditorChange={(content) =>
                        setFormData((prev) => ({ ...prev, title: content }))
                      }
                    />
                  </div>
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
                          className={`px-4 py-2 rounded-full ${
                            formData.category === cat
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-600 text-gray-700'
                          }`}
                        >
                          {cat.charAt(0) + cat.slice(1).toLowerCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Due on*
                      </label>
                      <input
                        type="date"
                        value={format(formData.dueDate, 'yyyy-MM-dd')}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            dueDate: new Date(e.target.value),
                          }))
                        }
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                        required
                      />
                    </div>
                    <TaskStatusDropdown
                      status={formData.status}
                      onStatusChange={(newStatus) =>
                        setFormData((prev) => ({ ...prev, status: newStatus }))
                      }
                    />
                  </div>
                  <div {...getRootProps()} className="border-2 border-dashed p-4">
                    <input {...getInputProps()} />
                    <p>Drag files here or click to upload (max 5 files, 5MB each).</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {filePreviews.map((url, idx) => (
                      <div key={idx} className="w-20 h-20 rounded-lg overflow-hidden bg-gray-200">
                        <img
                          src={url}
                          alt={`Preview ${idx + 1}`}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-4 py-2 border rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg"
                      disabled={isAddingTask}
                    >
                      {isAddingTask ? 'Creating...' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </Dialog>
    </DndProvider>
  );
};

export default CreateTaskDialog;

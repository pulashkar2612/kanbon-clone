import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ListView from './ListView/ListView';
import Filter from './Filter';
import { useAuth } from '../hooks/useAuth';
import { useView } from '../hooks/useView';
import CreateTaskDialog from './NewTaskDialog';
import BoardView from './BoardView/BoardView';

const TaskWrapper: React.FC = () => {
  const { user } = useAuth();
  const { view } = useView(user?.uid);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filters, setFilters] = useState<{
    category: string;
    dueDate: string;
    searchQuery: string;
  }>({
    category: 'all',
    dueDate: 'all',
    searchQuery: '',
  });
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Filter filters={filters} setFilters={setFilters} setDialogOpen={setDialogOpen} />
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {view === 'list' ? (
            <ListView filters={filters} uid={user?.uid || ''} />
          ) : (
            <BoardView filters={filters} uid={user?.uid || ''} />
          )}
        </motion.div>
      </AnimatePresence>

      <CreateTaskDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        uid={user?.uid || ''}
      />
    </div>
  );
};

export default TaskWrapper;

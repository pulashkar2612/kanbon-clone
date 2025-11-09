// src/components/ThemeToggle.tsx
import { motion } from 'motion/react';
import { FaMoon, FaSun } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
const ThemeToggle: React.FC = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme(user?.uid);

  const handleThemeToggle = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <motion.button
      onClick={handleThemeToggle}
      className="relative p-2 rounded-full bg-gray-200 dark:bg-gray-700 transition-colors duration-300"
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === 'light' ? 180 : 0 }}
        transition={{ duration: 0.3 }}
        className="text-yellow-500 dark:text-purple-500 dark:hover:text-purple-600"
      >
        {theme === 'light' ? <FaSun size={20} /> : <FaMoon size={20} />}
      </motion.div>
    </motion.button>
  );
};

export default ThemeToggle;

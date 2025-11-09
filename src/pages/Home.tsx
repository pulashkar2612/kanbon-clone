// src/pages/Home.tsx
import React from 'react';
import { Helmet } from 'react-helmet-async';
import TaskWrapper from '../components/TaskWrapper';
import { motion } from 'framer-motion';

const Home: React.FC = () => {
  // Define refined animations for the shapes
  const floatingShapes = {
    animate: {
      y: ['0%', '5%', '0%'], // Gentle up and down motion
      x: ['0%', '3%', '0%'], // Slight left to right movement
      transition: {
        repeat: Infinity,
        duration: 12,
        ease: 'easeInOut',
        repeatType: 'reverse' as const, // Corrected repeatType value
      },
    },
  };

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen">
      <Helmet>
        <title>Kanban</title>
        <meta
          name="description"
          content="Welcome to Kanban-Task Scheduler! Organize your tasks effectively."
        />
      </Helmet>

      {/* Background with subtle gradient animation */}
      <motion.div
        className="relative min-h-screen"
        style={{
          background: 'linear-gradient(135deg, #2c3e50, #34495e)', // Dark gradient for dark mode
        }}
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        <TaskWrapper />

        {/* Refined Floating Abstract Shapes with pointer-events-none */}
        <motion.div
          className="absolute w-48 h-48 bg-gray-700 dark:bg-gray-800 rounded-full opacity-30 pointer-events-none"
          {...floatingShapes}
          style={{
            top: '15%',
            left: '20%',
          }}
        />
        <motion.div
          className="absolute w-56 h-56 bg-gray-600 dark:bg-gray-700 rounded-full opacity-25 pointer-events-none"
          {...floatingShapes}
          style={{
            top: '50%',
            left: '45%',
          }}
        />
        <motion.div
          className="absolute w-40 h-40 bg-gray-500 dark:bg-gray-600 rounded-full opacity-15 pointer-events-none"
          {...floatingShapes}
          style={{
            top: '80%',
            left: '70%',
          }}
        />
      </motion.div>
    </div>
  );
};

export default Home;

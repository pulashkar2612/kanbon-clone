// src/components/Login.tsx
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'motion/react';

const Login: React.FC = () => {
  const { user, signIn, isLoading, error, isSigningIn } = useAuth();

  // Animation for the background gradient
  const backgroundAnimation = {
    animate: {
      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
      transition: {
        duration: 15,
        repeat: Infinity,
        ease: 'linear',
      },
    },
  };

  const floatingShapes = {
    animate: {
      y: ['0%', '5%', '0%'], // Moves up and down
      x: ['0%', '4%', '0%'], // Moves left to right
      transition: {
        repeat: Infinity,
        duration: 10,
        ease: 'easeInOut',
        repeatType: 'reverse' as const,
      },
    },
  };

  return (
    <motion.div
      style={{ height: '100vh' }}
      className="flex justify-center items-center bg-gradient-to-r from-gray-200 to-gray-400"
      {...backgroundAnimation}
    >
      <div className="bg-gray-900 p-8 rounded-xl shadow-xl w-full sm:w-96 space-y-6 z-10 relative">
        {/* Abstract Floating Shapes with pointer-events-none */}
        <motion.div
          className="absolute w-32 h-32 bg-indigo-300 rounded-full opacity-30 pointer-events-none"
          {...floatingShapes}
          style={{
            top: '10%',
            left: '15%',
          }}
        />
        <motion.div
          className="absolute w-40 h-40 bg-teal-400 rounded-full opacity-25 pointer-events-none"
          {...floatingShapes}
          style={{
            top: '50%',
            left: '40%',
          }}
        />
        <motion.div
          className="absolute w-48 h-48 bg-pink-200 rounded-full opacity-15 pointer-events-none"
          {...floatingShapes}
          style={{
            top: '70%',
            left: '70%',
          }}
        />

        {/* SVG Animation: Rotating Circle */}
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          width="80"
          height="80"
          viewBox="0 0 100 100"
          className="mx-auto"
          animate={{ rotate: 360 }}
          transition={{
            repeat: Infinity,
            repeatType: 'loop',
            duration: 1,
            ease: 'linear',
          }}
        >
          <circle cx="50" cy="50" r="40" stroke="white" strokeWidth="8" fill="none" />
          <motion.circle
            cx="50"
            cy="50"
            r="40"
            stroke="white"
            strokeWidth="8"
            fill="none"
            strokeDasharray="251.2"
            strokeDashoffset="125.6"
            initial={{ strokeDashoffset: 251.2 }}
            animate={{ strokeDashoffset: 0 }}
            transition={{
              repeat: Infinity,
              repeatType: 'reverse',
              duration: 1,
              ease: 'linear',
            }}
          />
        </motion.svg>

        {/* Loading State */}
        {isLoading || isSigningIn ? <div className="text-center text-white">Loading...</div> : null}

        {/* Error Message */}
        {error && (
          <div className="text-red-600 p-2 rounded-lg bg-red-100">Error: {error.message}</div>
        )}

        {/* User Welcome */}
        {user ? (
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-semibold text-yellow-400">Welcome, {user.displayName}</h2>
            <p className="text-gray-200">You are successfully signed in!</p>
            <button
              onClick={() => signIn()}
              className="w-full py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-500 transform transition-all duration-300 ease-in-out"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="space-y-4 text-center">
            <h2 className="text-2xl font-semibold text-white">Sign in to continue</h2>
            <button
              onClick={() => signIn()}
              className="w-full py-2 bg-green-500 text-white font-semibold rounded-lg shadow-lg hover:bg-green-400 transform transition-all duration-300 ease-in-out"
            >
              Sign In with Google
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Login;

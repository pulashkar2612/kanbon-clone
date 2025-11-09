import React from 'react';
import ThemeToggle from './ThemeToggle';
import { BsFillKanbanFill, BsThreeDotsVertical } from 'react-icons/bs';
import { useAuth } from '../hooks/useAuth';
import DropdownMenu from './Logout';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();

  const options = [{ label: 'Log Out', onClick: signOut }];

  return (
    <div className="flex justify-between p-4 bg-gray-100 dark:bg-gray-800 transition-colors duration-300">
      <h1 className="flex text-2xl dark:text-white font-bold items-center gap-2">
        <BsFillKanbanFill />
        Kanban
      </h1>
      <div className="controls flex items-center gap-4">
        <ThemeToggle />
        {/* <div className="ruler" /> */}
        {user && (
          <div className="flex items-center gap-2">
            <img
              src={user.photoURL || '/default-avatar.png'}
              alt={user.displayName || 'User'}
              className="w-8 h-8 rounded-full"
            />
            <span className="dark:text-white">{user.displayName || 'User'}</span>
          </div>
        )}
        {/* <div className="ruler" /> */}
        <DropdownMenu data={options} position="right">
          <BsThreeDotsVertical />
        </DropdownMenu>
      </div>
    </div>
  );
};

export default Header;

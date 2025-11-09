import React, { useState, useRef } from 'react';

interface DropdownMenuProps {
  children: React.ReactNode;
  data: { label: string; onClick: () => void }[];
  position: 'left' | 'right';
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ children, data, position }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <div
      className="relative inline-block text-left"
      ref={dropdownRef}
      tabIndex={0}
      onBlur={(e) => {
        if (!dropdownRef.current?.contains(e.relatedTarget as Node)) {
          closeMenu();
        }
      }}
    >
      {/* Menu Button */}
      <button onClick={toggleMenu} className="flex justify-center text-xl dark:text-white">
        {children}
      </button>

      {/* Menu Items */}
      {isOpen && (
        <div
          className={`absolute ${position}-0 z-10 mt-3 w-56 origin-top-${position} rounded-md bg-white shadow-lg ring-1 ring-black/5 dark:bg-gray-800 dark:ring-gray-700 focus:outline-none`}
        >
          <div className="py-1">
            {data.map((menu, index) => (
              <button
                key={index}
                onClick={() => {
                  menu.onClick();
                  closeMenu();
                }}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
              >
                {menu.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;

import React, { useEffect, useState, useRef } from 'react';
import { FaCheck } from 'react-icons/fa';

export interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
}

export interface DropdownItemProps {
  label: string;
  value: string;
  selected?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export const DropdownItem: React.FC<DropdownItemProps> = ({
  label,
  selected,
  onClick,
  icon,
  className,
}) => (
  <button
    onClick={onClick}
    className={`w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 dark:text-gray-200 dark:hover:bg-gray-700 ${className}`}
  >
    {icon && <span className="w-4 h-4">{icon}</span>}
    <FaCheck className={`h-3 w-3 ${selected ? 'opacity-100' : 'opacity-0'}`} />
    {label}
  </button>
);

export const Dropdown: React.FC<DropdownProps> = ({ trigger, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Calculate position of dropdown to ensure it's within the viewport
  const calculateDropdownPosition = () => {
    if (dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      if (rect.bottom + 200 > window.innerHeight) {
        return { bottom: '100%' }; // Place the dropdown above the trigger
      }
    }
    return { top: '100%' }; // Place it below the trigger by default
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10 z-10"
          style={calculateDropdownPosition()}
        >
          <div className="py-1 max-h-60 overflow-y-auto">{children}</div>
        </div>
      )}
    </div>
  );
};

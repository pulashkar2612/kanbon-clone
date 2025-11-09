import React from 'react';
import { FaListUl, FaThLarge, FaPlus, FaChevronDown } from 'react-icons/fa';
import { Button } from './ui/Button';
import { Dropdown, DropdownItem } from './ui/Dropdown';
import { SearchInput } from './ui/Search';
import { useView } from '../hooks/useView';
import { useAuth } from '../hooks/useAuth';

interface FilterProps {
  filters: { category: string; dueDate: string; searchQuery?: string };
  setFilters: React.Dispatch<
    React.SetStateAction<{ category: string; dueDate: string; searchQuery: string }>
  >;
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
const Filter: React.FC<FilterProps> = ({ filters, setFilters, setDialogOpen }) => {
  const { user } = useAuth();
  const { view, toggleView } = useView(user?.uid);
  const categories = [
    { label: 'All Categories', value: 'all' },
    { label: 'Work', value: 'work' },
    { label: 'Personal', value: 'personal' },
  ];

  const dueDates = [
    { label: 'All Dates', value: 'all' },
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'this-week' },
  ];

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center p-4">
      <div className="flex items-center gap-2">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-1 flex gap-1">
          <Button
            variant={view === 'list' ? 'secondary' : 'ghost'}
            onClick={toggleView}
            className="flex items-center gap-2"
          >
            <FaListUl className="h-4 w-4" />
            <span className="hidden sm:inline">List</span>
          </Button>
          <Button
            variant={view === 'grid' ? 'secondary' : 'ghost'}
            onClick={toggleView}
            className="flex items-center gap-2"
          >
            <FaThLarge className="h-4 w-4" />
            <span className="hidden sm:inline">Board</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Dropdown
          trigger={
            <Button variant="outline" className="flex items-center gap-2">
              Category
              <FaChevronDown className="h-3 w-3" />
            </Button>
          }
        >
          {categories.map((category) => (
            <DropdownItem
              key={category.value}
              label={category.label}
              value={category.value}
              selected={filters.category === category.value}
              onClick={() => setFilters((prev) => ({ ...prev, category: category.value }))}
            />
          ))}
        </Dropdown>

        <Dropdown
          trigger={
            <Button variant="outline" className="flex items-center gap-2">
              Due Date
              <FaChevronDown className="h-3 w-3" />
            </Button>
          }
        >
          {dueDates.map((date) => (
            <DropdownItem
              key={date.value}
              label={date.label}
              value={date.value}
              selected={filters.dueDate === date.value}
              onClick={() => setFilters((prev) => ({ ...prev, dueDate: date.value }))}
            />
          ))}
        </Dropdown>

        <SearchInput
          placeholder="Search tasks..."
          className="min-w-[200px]"
          onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
        />

        <Button className="flex items-center gap-2" onClick={() => setDialogOpen(true)}>
          <FaPlus className="h-4 w-4" />
          Add Task
        </Button>
      </div>
    </div>
  );
};

export default Filter;

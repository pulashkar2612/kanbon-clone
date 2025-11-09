import { format, parseISO, formatDistanceToNow } from 'date-fns';

export const dateUtils = {
  formatDate: (date: number | string | Date) => {
    const parsedDate = typeof date === 'string' ? parseISO(date) : new Date(date);
    return format(parsedDate, 'MMM dd, yyyy');
  },

  formatDateTime: (date: number | string | Date) => {
    const parsedDate = typeof date === 'string' ? parseISO(date) : new Date(date);
    return format(parsedDate, 'MMM dd, yyyy HH:mm');
  },

  formatRelative: (date: number | string | Date) => {
    const parsedDate = typeof date === 'string' ? parseISO(date) : new Date(date);
    return formatDistanceToNow(parsedDate, { addSuffix: true });
  },

  toUTC: (date: Date) => {
    const offset = date.getTimezoneOffset();
    return new Date(date.getTime() + offset * 60 * 1000);
  },

  toLocal: (timestamp: number) => {
    const date = new Date(timestamp);
    const offset = date.getTimezoneOffset();
    return new Date(date.getTime() - offset * 60 * 1000);
  },
};

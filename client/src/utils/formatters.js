import { format, formatDistanceToNowStrict, isPast, isToday, parseISO } from 'date-fns';

export const formatDate = (value) => {
  if (!value) {
    return 'Not scheduled';
  }

  const date = typeof value === 'string' ? parseISO(value) : value;
  return format(date, 'MMM d, yyyy');
};

export const formatRelativeTime = (value) => {
  if (!value) {
    return 'Just now';
  }

  const date = typeof value === 'string' ? parseISO(value) : value;
  return `${formatDistanceToNowStrict(date, { addSuffix: true })}`;
};

export const formatFileSize = (bytes = 0) => {
  if (bytes === 0) {
    return '0 KB';
  }

  const units = ['B', 'KB', 'MB', 'GB'];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;
  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
};

export const getDueDateState = (value, status) => {
  if (!value) {
    return 'default';
  }

  const date = typeof value === 'string' ? parseISO(value) : value;

  if (status !== 'Published' && isPast(date) && !isToday(date)) {
    return 'overdue';
  }

  return 'default';
};

export const getApiBase = () => import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getServerOrigin = () => getApiBase().replace(/\/api$/, '');

export const resolveAssetUrl = (assetUrl) => {
  if (!assetUrl) {
    return '';
  }

  if (assetUrl.startsWith('http') || assetUrl.startsWith('data:')) {
    return assetUrl;
  }

  return `${getServerOrigin()}${assetUrl.startsWith('/') ? assetUrl : `/${assetUrl}`}`;
};


export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const truncateText = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const getRoleRedirect = (role) => {
  switch(role) {
    case 'ADMIN':
      return '/admin/dashboard';
    case 'USER':
    case 'TECHNICIAN':
      return '/dashboard';
    default:
      return '/';
  }
};

export const timeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return Math.floor(seconds/60) + ' min ago';
  if (seconds < 86400) return Math.floor(seconds/3600) + ' hr ago';
  if (seconds < 604800) return Math.floor(seconds/86400) + ' days ago';
  return date.toLocaleDateString();
};

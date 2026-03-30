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

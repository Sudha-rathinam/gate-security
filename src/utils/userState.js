let userName = 'Bala';

export const getUserName = () => userName;

export const setUserName = (name) => {
  userName = name || 'Bala';
};

export const getInitials = (name) => {
  if (!name) return 'GS';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + (parts[parts.length - 1][0] || '')).toUpperCase();
};

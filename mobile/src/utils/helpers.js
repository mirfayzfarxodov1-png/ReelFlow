// Format number (K, M)
export const formatNumber = (num) => {
  if (!num) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

// Format time
export const formatTime = (date) => {
  const now = new Date();
  const diff = now - new Date(date);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Hozirgina';
  if (minutes < 60) return `${minutes} daqiqa oldin`;
  if (hours < 24) return `${hours} soat oldin`;
  if (days < 7) return `${days} kun oldin`;
  return new Date(date).toLocaleDateString();
};

// Format duration (seconds to MM:SS)
export const formatDuration = (seconds) => {
  if (!seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

// Validate email
export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Validate username
export const isValidUsername = (username) => {
  const regex = /^[a-zA-Z0-9_]{3,30}$/;
  return regex.test(username);
};

// Validate password
export const isValidPassword = (password) => {
  return password.length >= 6;
};

// Truncate text
export const truncateText = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Extract hashtags from text
export const extractHashtags = (text) => {
  const regex = /#(\w+)/g;
  const matches = text.match(regex);
  return matches ? matches.map(tag => tag.substring(1)) : [];
};

// Extract mentions from text
export const extractMentions = (text) => {
  const regex = /@(\w+)/g;
  const matches = text.match(regex);
  return matches ? matches.map(mention => mention.substring(1)) : [];
};

// Debounce function
export const debounce = (func, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
};

// Get file extension
export const getFileExtension = (filename) => {
  return filename?.split('.').pop()?.toLowerCase();
};

// Check if video format is supported
export const isSupportedVideo = (filename) => {
  const supported = ['mp4', 'mov', 'avi', 'mkv', 'webm'];
  return supported.includes(getFileExtension(filename));
};

// Get random color
export const getRandomColor = () => {
  const colors = ['#f09433', '#d62976', '#962fbf', '#0095f6', '#00c853'];
  return colors[Math.floor(Math.random() * colors.length)];
};

import { toast } from 'sonner';

// Function to validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Function to validate IMAP settings format
export const validateImapSettings = (
  host: string,
  port: string,
): boolean => {
  if (!host || host.trim() === '') {
    toast.error("IMAP host is required");
    return false;
  }
  
  const portNum = parseInt(port, 10);
  if (isNaN(portNum) || portNum <= 0 || portNum > 65535) {
    toast.error("IMAP port must be a valid number between 1-65535");
    return false;
  }
  
  return true;
};

// Format date for display
export const formatEmailDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  
  // If today, just show time
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  // If this year, show month and day
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
  
  // Otherwise show full date
  return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
};

// Extract domain from email address
export const extractEmailDomain = (email: string): string => {
  const parts = email.split('@');
  return parts.length > 1 ? parts[1] : email;
};

// Truncate text with ellipsis
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

// Get safe color based on importance score (for custom styling)
export const getImportanceColor = (score: number): string => {
  // Dark red with varying opacity based on importance
  const opacity = 0.3 + (score / 100) * 0.7;
  return `rgba(139, 0, 0, ${opacity.toFixed(2)})`;
};

/**
 * Formats a UNIX timestamp into a human-readable "time ago" string.
 * @param {number} timestamp - The UNIX timestamp in seconds.
 * @returns {string} A formatted string like "5 minutes ago", "3 hours ago", etc.
 */
export function formatTimeAgo(timestamp) {
  if (!timestamp || timestamp === 0) {
    return 'No recent burns';
  }

  const now = new Date();
  const burnTime = new Date(timestamp * 1000);
  const seconds = Math.floor((now - burnTime) / 1000);

  let interval = seconds / 31536000; // years
  if (interval > 1) {
    return Math.floor(interval) + (Math.floor(interval) === 1 ? " year ago" : " years ago");
  }
  interval = seconds / 2592000; // months
  if (interval > 1) {
    return Math.floor(interval) + (Math.floor(interval) === 1 ? " month ago" : " months ago");
  }
  interval = seconds / 86400; // days
  if (interval > 1) {
    return Math.floor(interval) + (Math.floor(interval) === 1 ? " day ago" : " days ago");
  }
  interval = seconds / 3600; // hours
  if (interval > 1) {
    return Math.floor(interval) + (Math.floor(interval) === 1 ? " hour ago" : " hours ago");
  }
  interval = seconds / 60; // minutes
  if (interval > 1) {
    return Math.floor(interval) + (Math.floor(interval) === 1 ? " minute ago" : " minutes ago");
  }
  
  // Handle case for less than a minute
  if (seconds < 10) {
    return "Just now";
  }

  return Math.floor(seconds) + " seconds ago";
}

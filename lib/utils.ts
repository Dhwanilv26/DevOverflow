import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const getTimeStamp = (createdAt: Date): string => {
  const now = new Date();
  const secondsAgo = Math.floor((now.getTime() - createdAt.getTime()) / 1000);

  let interval = secondsAgo / 31536000; // Years
  if (interval >= 1) {
    return `${Math.floor(interval)} year${Math.floor(interval) > 1 ? 's' : ''} ago`;
  }

  interval = secondsAgo / 2592000; // Months
  if (interval >= 1) {
    return `${Math.floor(interval)} month${Math.floor(interval) > 1 ? 's' : ''} ago`;
  }

  interval = secondsAgo / 86400; // Days
  if (interval >= 1) {
    return `${Math.floor(interval)} day${Math.floor(interval) > 1 ? 's' : ''} ago`;
  }

  interval = secondsAgo / 3600; // Hours
  if (interval >= 1) {
    return `${Math.floor(interval)} hour${Math.floor(interval) > 1 ? 's' : ''} ago`;
  }

  interval = secondsAgo / 60; // Minutes
  if (interval >= 1) {
    return `${Math.floor(interval)} minute${Math.floor(interval) > 1 ? 's' : ''} ago`;
  }

  return `${secondsAgo} second${secondsAgo > 1 ? 's' : ''} ago`;
};

export const formatLargeNumber = (num: number | null | undefined): string => {
  const safeNum = num ?? 0; // Default to 0 if num is null or undefined

  if (safeNum >= 1000000) {
    return `${(safeNum / 1000000).toFixed(1)}M`;
  } else if (safeNum >= 1000) {
    return `${(safeNum / 1000).toFixed(1)}K`;
  } else {
    return safeNum.toString();
  }
};

export const getJoinedDate = (date: Date): string => {
  // Extract the month and year from the Date object
  const month = date.toLocaleString('default', { month: 'long' });
  const year = date.getFullYear();

  // Create the joined date string (e.g., "September 2023")
  const joinedDate = `${month} ${year}`;

  return joinedDate;
};
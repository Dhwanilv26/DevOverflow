import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const getTimeStamp = (createdAt: Date): string => {
  const now = new Date();
  const secondsAgo = Math.floor((now.getTime() - createdAt.getTime()) / 1000);

  let interval = secondsAgo / 31536000; // Years
  if (interval >= 1) {
    return `${Math.floor(interval)} year${Math.floor(interval) > 1 ? "s" : ""} ago`;
  }

  interval = secondsAgo / 2592000; // Months
  if (interval >= 1) {
    return `${Math.floor(interval)} month${Math.floor(interval) > 1 ? "s" : ""} ago`;
  }

  interval = secondsAgo / 86400; // Days
  if (interval >= 1) {
    return `${Math.floor(interval)} day${Math.floor(interval) > 1 ? "s" : ""} ago`;
  }

  interval = secondsAgo / 3600; // Hours
  if (interval >= 1) {
    return `${Math.floor(interval)} hour${Math.floor(interval) > 1 ? "s" : ""} ago`;
  }

  interval = secondsAgo / 60; // Minutes
  if (interval >= 1) {
    return `${Math.floor(interval)} minute${Math.floor(interval) > 1 ? "s" : ""} ago`;
  }

  return `${secondsAgo} second${secondsAgo > 1 ? "s" : ""} ago`;
};

export const formatLargeNumber = (num: number): string => {
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(1)}B`; // Billions
  } else if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`; // Millions
  } else if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`; // Thousands
  }
  return num.toString(); // For numbers less than a thousand
};

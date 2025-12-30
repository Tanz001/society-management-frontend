import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format 24-hour time string to AM/PM format
 * @param time24 - Time string in 24-hour format (HH:MM or HH:MM:SS)
 * @returns Formatted time string in AM/PM format (e.g., "2:30 PM")
 */
export function formatTimeToAMPM(time24: string | null | undefined): string {
  if (!time24) return "N/A";
  
  // Handle time strings that might include seconds
  const timeStr = time24.substring(0, 5); // Take only HH:MM
  const [hours, minutes] = timeStr.split(':').map(Number);
  
  if (isNaN(hours) || isNaN(minutes)) return "N/A";
  
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
  
  return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
}
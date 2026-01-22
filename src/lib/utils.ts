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

/**
 * Get the correct dashboard path based on user role from localStorage
 * This ensures users are redirected to their appropriate dashboard
 * @returns Dashboard path string (e.g., "/dashboard/student", "/dashboard/admin/board-secretary")
 */
export function getDashboardPath(): string {
  try {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      return "/dashboard/student"; // Default fallback
    }

    const user = JSON.parse(userStr);
    const roles = user.roles || [];
    
    // Check if user is a student (has rollNo or isStudent flag)
    const isStudent = user.rollNo || (!user.faculty_id && roles.length === 0);
    
    if (isStudent) {
      return "/dashboard/student";
    }

    // Extract role names
    const roleNames = roles.map((r: any) => String(r.role_name || "").toLowerCase());

    // Admin roles - check in priority order
    if (roleNames.includes("vc")) {
      return "/dashboard/admin/vc";
    }
    if (roleNames.includes("board_secretary")) {
      return "/dashboard/admin/board-secretary";
    }
    if (roleNames.includes("board_president")) {
      return "/dashboard/admin/board-president";
    }
    if (roleNames.includes("registrar")) {
      return "/dashboard/admin/registrar";
    }
    if (roleNames.includes("transport_office")) {
      return "/dashboard/admin/transport-office";
    }
    if (roleNames.includes("protocol_office")) {
      return "/dashboard/admin/protocol-office";
    }
    if (roleNames.includes("admin")) {
      return "/dashboard/admin";
    }
    if (roleNames.includes("advisor")) {
      return "/dashboard/advisor";
    }

    // If user is faculty but no roles found, default to advisor dashboard
    if (user.faculty_id) {
      return "/dashboard/advisor";
    }

    // Default fallback
    return "/dashboard/student";
  } catch (error) {
    console.error("Error determining dashboard path:", error);
    return "/dashboard/student"; // Safe fallback
  }
}
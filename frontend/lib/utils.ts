import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Extracts and de-duplicates all valid email addresses from text or CSV content.
 * Regex matches Outbox Labs requirement: /[\w.-]+@[\w.-]+\.\w+/g
 */
export function parseEmailsFromText(text: string): string[] {
  const matches = text.match(/[\w.-]+@[\w.-]+\.\w+/g) || [];
  const normalized = matches.map((m) => m.trim().toLowerCase());
  return Array.from(new Set(normalized));
}

/**
 * Formats a date string to the exact Outbox Labs / Figma format:
 * MMM DD, hh:mm a (e.g., "Oct 10, 10:00 am")
 */
export function formatScheduledTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[date.getMonth()];
    const day = String(date.getDate()).padStart(2, '0');

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 becomes 12
    const strHours = String(hours).padStart(2, '0');

    return `${month} ${day}, ${strHours}:${minutes} ${ampm}`;
  } catch {
    return dateString;
  }
}

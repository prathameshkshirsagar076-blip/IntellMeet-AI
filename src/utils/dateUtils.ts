/**
 * Date utility helpers for IntellMeet AI
 * Ensures local timezone consistency and prevents scheduling in the past.
 */

export const formatLocalDate = (d: Date = new Date()): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const getTodayLocalDateString = (): string => {
  return formatLocalDate(new Date());
};

export const isPastDate = (dateStr: string): boolean => {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  return dateStr < getTodayLocalDateString();
};

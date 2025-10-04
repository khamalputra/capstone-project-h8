import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const roleHierarchy = ['USER', 'PROVIDER', 'ADMIN'] as const;
export type Role = (typeof roleHierarchy)[number];

export function canAccess(required: Role, actual?: Role | null) {
  if (!actual) return false;
  return roleHierarchy.indexOf(actual) >= roleHierarchy.indexOf(required);
}

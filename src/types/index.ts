/**
 * Shared type definitions for the application
 * These mirror the Prisma schema enums for use in client components
 */

// Project status values
export type ProjectStatus = "ACTIVE" | "ARCHIVED" | "COMPLETED";

// Task status values
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

// Task priority values
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

// Utility type for select options
export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
}

// Project status options for select dropdowns
export const PROJECT_STATUS_OPTIONS: SelectOption<ProjectStatus>[] = [
  { value: "ACTIVE", label: "Active" },
  { value: "ARCHIVED", label: "Archived" },
  { value: "COMPLETED", label: "Completed" },
];

// Task status options for select dropdowns
export const TASK_STATUS_OPTIONS: SelectOption<TaskStatus>[] = [
  { value: "TODO", label: "To Do" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "DONE", label: "Done" },
];

// Task priority options for select dropdowns
export const TASK_PRIORITY_OPTIONS: SelectOption<TaskPriority>[] = [
  { value: "LOW", label: "Low Priority" },
  { value: "MEDIUM", label: "Medium Priority" },
  { value: "HIGH", label: "High Priority" },
];

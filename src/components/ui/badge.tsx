import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  const variants = {
    default: "bg-[var(--badge-gray-bg)] text-[var(--badge-gray-text)]",
    success: "bg-[var(--badge-green-bg)] text-[var(--badge-green-text)]",
    warning: "bg-[var(--badge-yellow-bg)] text-[var(--badge-yellow-text)]",
    error: "bg-[var(--badge-red-bg)] text-[var(--badge-red-text)]",
    info: "bg-[var(--badge-blue-bg)] text-[var(--badge-blue-text)]",
  };

  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", variants[variant], className)}>{children}</span>;
}

// Status badges
export function ProjectStatusBadge({ status }: { status: string }) {
  const variants: Record<string, "success" | "warning" | "info"> = {
    ACTIVE: "success",
    ARCHIVED: "warning",
    COMPLETED: "info",
  };

  return <Badge variant={variants[status] || "default"}>{status.charAt(0) + status.slice(1).toLowerCase()}</Badge>;
}

export function TaskStatusBadge({ status }: { status: string }) {
  const variants: Record<string, "default" | "warning" | "success"> = {
    TODO: "default",
    IN_PROGRESS: "warning",
    DONE: "success",
  };

  const labels: Record<string, string> = {
    TODO: "To Do",
    IN_PROGRESS: "In Progress",
    DONE: "Done",
  };

  return <Badge variant={variants[status] || "default"}>{labels[status] || status}</Badge>;
}

export function TaskPriorityBadge({ priority }: { priority: string }) {
  const variants: Record<string, "success" | "warning" | "error"> = {
    LOW: "success",
    MEDIUM: "warning",
    HIGH: "error",
  };

  return <Badge variant={variants[priority] || "default"}>{priority.charAt(0) + priority.slice(1).toLowerCase()}</Badge>;
}

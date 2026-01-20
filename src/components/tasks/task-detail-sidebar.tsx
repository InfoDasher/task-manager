"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { TaskStatus, TaskPriority, ProjectStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { TaskStatusBadge, TaskPriorityBadge, ProjectStatusBadge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatDate } from "@/lib/utils";
import { X, Pencil, Trash2, Save, FolderOpen, Calendar, Clock, AlertCircle } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  project: {
    id: string;
    name: string;
    status: ProjectStatus;
  };
}

interface TaskDetailSidebarProps {
  taskId: string | null;
  onClose: () => void;
  onDeleted?: () => void;
}

export function TaskDetailSidebar({ taskId, onClose, onDeleted }: TaskDetailSidebarProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editPriority, setEditPriority] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["task", taskId],
    queryFn: async () => {
      const res = await fetch(`/api/tasks/${taskId}`);
      if (!res.ok) throw new Error("Failed to fetch task");
      return res.json();
    },
    enabled: !!taskId,
  });

  const task: Task | undefined = data?.data;

  // Reset editing state when task changes
  useEffect(() => {
    setIsEditing(false);
  }, [taskId]);

  const updateTaskMutation = useMutation({
    mutationFn: async (updateData: { title?: string; description?: string; status?: string; priority?: string; dueDate?: string | null }) => {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      if (!res.ok) throw new Error("Failed to update task");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
      queryClient.invalidateQueries({ queryKey: ["all-tasks"] });
      setIsEditing(false);
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete task");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-tasks"] });
      onDeleted?.();
      onClose();
    },
  });

  const handleStartEdit = () => {
    if (task) {
      setEditTitle(task.title);
      setEditDescription(task.description || "");
      setEditStatus(task.status);
      setEditPriority(task.priority);
      setEditDueDate(task.dueDate ? task.dueDate.split("T")[0] : "");
      setIsEditing(true);
    }
  };

  const handleSaveEdit = () => {
    updateTaskMutation.mutate({
      title: editTitle,
      description: editDescription || undefined,
      status: editStatus,
      priority: editPriority,
      dueDate: editDueDate || null,
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const confirmDelete = () => {
    deleteTaskMutation.mutate();
    setShowDeleteConfirm(false);
  };

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isEditing) {
          setIsEditing(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isEditing, onClose]);

  if (!taskId) return null;

  return (
    <>
      {/* Backdrop - use min-h-screen to ensure full coverage */}
      <div className="fixed top-0 left-0 right-0 bottom-0 min-h-screen bg-black/50 z-40 animate-in fade-in duration-200" onClick={onClose} />

      {/* Sidebar with slide-in animation */}
      <div
        className="fixed inset-y-0 right-0 w-full max-w-lg bg-card border-l border-card-border shadow-xl z-50 flex flex-col"
        style={{
          animation: "slideInFromRight 0.3s ease-out forwards",
        }}
      >
        <style jsx>{`
          @keyframes slideInFromRight {
            from {
              transform: translateX(100%);
            }
            to {
              transform: translateX(0);
            }
          }
        `}</style>
        {/* Header - h-16 to match navbar */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-card-border bg-accent/30">
          <span className="text-sm font-medium text-foreground">{isEditing ? "Edit Task" : "Task Details"}</span>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-accent transition-colors" aria-label="Close sidebar">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            </div>
          ) : error || !task ? (
            <div className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <p className="text-destructive mb-4">Task not found or failed to load.</p>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          ) : isEditing ? (
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Title</label>
                <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Task title" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Description</label>
                <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} placeholder="Task description" rows={4} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Status</label>
                  <Select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    options={[
                      { value: "TODO", label: "To Do" },
                      { value: "IN_PROGRESS", label: "In Progress" },
                      { value: "DONE", label: "Done" },
                    ]}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Priority</label>
                  <Select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value)}
                    options={[
                      { value: "LOW", label: "Low" },
                      { value: "MEDIUM", label: "Medium" },
                      { value: "HIGH", label: "High" },
                    ]}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Due Date</label>
                <Input type="date" value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)} />
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* Title */}
              <div>
                <h2 className="text-2xl font-bold text-foreground">{task.title}</h2>
              </div>

              {/* Status & Priority Badges */}
              <div className="flex items-center gap-2">
                <TaskStatusBadge status={task.status} />
                <TaskPriorityBadge priority={task.priority} />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-foreground">Description</h3>
                <p className="text-base text-foreground leading-relaxed">{task.description || <span className="text-muted-foreground italic">No description</span>}</p>
              </div>

              {/* Metadata */}
              <div className="pt-4 border-t border-card-border space-y-2">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <FolderOpen className="h-3.5 w-3.5" />
                  <span>Project:</span>
                  <Link href={`/projects/${task.project.id}`} className="flex items-center gap-1.5 hover:text-primary transition-colors" onClick={onClose}>
                    <span className="font-medium">{task.project.name}</span>
                    <ProjectStatusBadge status={task.project.status} />
                  </Link>
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Created:</span>
                  <span>{formatDate(task.createdAt)}</span>
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Updated:</span>
                  <span>{formatDate(task.updatedAt)}</span>
                </div>

                {task.dueDate && (
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Due:</span>
                    <span className={new Date(task.dueDate) < new Date() && task.status !== "DONE" ? "text-destructive font-medium" : ""}>{formatDate(task.dueDate)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {task && (
          <div className="px-6 py-4 border-t border-card-border bg-accent/30">
            {isEditing ? (
              <div className="flex gap-3">
                <Button onClick={handleSaveEdit} isLoading={updateTaskMutation.isPending} className="flex-1">
                  <Save className="h-4 w-4 mr-1.5" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={handleCancelEdit} className="flex-1">
                  <X className="h-4 w-4 mr-1.5" />
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleStartEdit} className="flex-1">
                  <Pencil className="h-4 w-4 mr-1.5" />
                  Edit
                </Button>
                <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)} className="flex-1">
                  <Trash2 className="h-4 w-4 mr-1.5" />
                  Delete
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Task"
        description="Are you sure you want to delete this task? This action cannot be undone."
        confirmLabel="Delete Task"
        variant="danger"
        onConfirm={confirmDelete}
        isLoading={deleteTaskMutation.isPending}
      />
    </>
  );
}

"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { TaskStatus, TaskPriority, ProjectStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskStatusBadge, TaskPriorityBadge, ProjectStatusBadge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, Pencil, Trash2, Save, X, FolderOpen } from "lucide-react";

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

interface TaskResponse {
  success: boolean;
  data: Task;
}

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const taskId = params.id as string;

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editPriority, setEditPriority] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data, isLoading, error } = useQuery<TaskResponse>({
    queryKey: ["task", taskId],
    queryFn: async () => {
      const res = await fetch(`/api/tasks/${taskId}`);
      if (!res.ok) throw new Error("Failed to fetch task");
      return res.json();
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async (data: { title?: string; description?: string; status?: string; priority?: string; dueDate?: string | null }) => {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
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
      router.push("/tasks");
    },
  });

  const handleStartEdit = () => {
    if (data?.data) {
      setEditTitle(data.data.title);
      setEditDescription(data.data.description || "");
      setEditStatus(data.data.status);
      setEditPriority(data.data.priority);
      setEditDueDate(data.data.dueDate ? data.data.dueDate.split("T")[0] : "");
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

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    deleteTaskMutation.mutate();
    setShowDeleteConfirm(false);
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
        <p className="mt-4 text-muted-foreground">Loading task...</p>
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-destructive mb-4">Task not found or failed to load.</p>
          <Link href="/tasks">
            <Button variant="outline">Back to Tasks</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const task = data.data;

  return (
    <div className="space-y-6">
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

      {/* Task Detail Card */}
      <Card>
        <CardHeader className="border-b border-card-border">
          <div className="flex items-start justify-between">
            {isEditing ? (
              <div className="space-y-4 flex-1 mr-4">
                <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Task title" />
                <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} placeholder="Task description" rows={3} />
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    options={[
                      { value: "TODO", label: "To Do" },
                      { value: "IN_PROGRESS", label: "In Progress" },
                      { value: "DONE", label: "Done" },
                    ]}
                  />
                  <Select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value)}
                    options={[
                      { value: "LOW", label: "Low Priority" },
                      { value: "MEDIUM", label: "Medium Priority" },
                      { value: "HIGH", label: "High Priority" },
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Due Date</label>
                  <Input type="date" value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)} />
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center rounded-full bg-[var(--badge-purple-bg)] px-2.5 py-0.5 text-xs font-medium text-[var(--badge-purple-text)]">Task</span>
                  <TaskStatusBadge status={task.status} />
                  <TaskPriorityBadge priority={task.priority} />
                </div>
                <CardTitle className="mt-2 text-2xl text-foreground font-bold">{task.title}</CardTitle>
                <CardDescription className="mt-2 text-muted-foreground">{task.description || "No description"}</CardDescription>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-3">
                  <span>Created {formatDate(task.createdAt)}</span>
                  <span>Updated {formatDate(task.updatedAt)}</span>
                  {task.dueDate && <span>Due {formatDate(task.dueDate)}</span>}
                </div>
              </div>
            )}
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button onClick={handleSaveEdit} isLoading={updateTaskMutation.isPending}>
                    <Save className="h-4 w-4 mr-1.5" />
                    Save
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    <X className="h-4 w-4 mr-1.5" />
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={handleStartEdit}>
                    <Pencil className="h-4 w-4 mr-1.5" />
                    Edit
                  </Button>
                  <Button variant="destructive" onClick={handleDelete} isLoading={deleteTaskMutation.isPending}>
                    <Trash2 className="h-4 w-4 mr-1.5" />
                    Delete
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Project:</span>
            <Link href={`/projects/${task.project.id}`} className="flex items-center gap-2 hover:text-primary">
              <span className="font-medium">{task.project.name}</span>
              <ProjectStatusBadge status={task.project.status} />
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Link href="/tasks">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Tasks
          </Button>
        </Link>
        <Link href={`/projects/${task.project.id}`}>
          <Button variant="outline">
            <FolderOpen className="h-4 w-4 mr-1.5" />
            View Project
          </Button>
        </Link>
      </div>
    </div>
  );
}

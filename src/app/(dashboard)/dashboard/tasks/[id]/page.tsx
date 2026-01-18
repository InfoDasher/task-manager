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
import { TaskStatusBadge, TaskPriorityBadge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatDate, formatDateTime } from "@/lib/utils";

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
    mutationFn: async (updateData: { title?: string; description?: string | null; status?: string; priority?: string; dueDate?: string | null }) => {
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
      if (data?.data?.project?.id) {
        router.push(`/dashboard/projects/${data.data.project.id}`);
      } else {
        router.push("/dashboard/tasks");
      }
    },
  });

  const handleStartEdit = () => {
    if (data?.data) {
      setEditTitle(data.data.title);
      setEditDescription(data.data.description || "");
      setEditStatus(data.data.status);
      setEditPriority(data.data.priority);
      setEditDueDate(data.data.dueDate ? new Date(data.data.dueDate).toISOString().split("T")[0] : "");
      setIsEditing(true);
    }
  };

  const handleSaveEdit = () => {
    updateTaskMutation.mutate({
      title: editTitle,
      description: editDescription || null,
      status: editStatus,
      priority: editPriority,
      dueDate: editDueDate ? new Date(editDueDate).toISOString() : null,
    });
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    deleteTaskMutation.mutate();
    setShowDeleteConfirm(false);
  };

  const handleQuickStatusChange = (newStatus: string) => {
    updateTaskMutation.mutate({ status: newStatus });
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="mt-4 text-gray-600">Loading task...</p>
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-red-600 mb-4">Task not found or failed to load.</p>
          <Link href="/dashboard/tasks">
            <Button variant="outline">Back to Tasks</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const task = data.data;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
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

      {/* Breadcrumb Navigation */}
      <nav className="flex items-center text-sm text-gray-500">
        <Link href="/dashboard/projects" className="hover:text-blue-600">
          Projects
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/dashboard/projects/${task.project.id}`} className="hover:text-blue-600">
          {task.project.name}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">{task.title}</span>
      </nav>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            {isEditing ? (
              <div className="space-y-4 flex-1 mr-4">
                <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Task title" />
                <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} placeholder="Task description" rows={4} />
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
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Due Date</label>
                  <Input type="date" value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)} />
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <CardTitle className="text-2xl text-gray-900 font-bold">{task.title}</CardTitle>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <TaskStatusBadge status={task.status} />
                  <TaskPriorityBadge priority={task.priority} />
                </div>
                <CardDescription className="text-base text-gray-600">{task.description || "No description"}</CardDescription>
              </div>
            )}
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button onClick={handleSaveEdit} isLoading={updateTaskMutation.isPending}>
                    Save
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={handleStartEdit}>
                    Edit
                  </Button>
                  <Button variant="destructive" onClick={handleDelete} isLoading={deleteTaskMutation.isPending}>
                    Delete
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quick Status Change */}
          {!isEditing && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Quick Status Update</label>
              <div className="flex gap-2">
                {["TODO", "IN_PROGRESS", "DONE"].map((status) => (
                  <Button
                    key={status}
                    variant={task.status === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleQuickStatusChange(status)}
                    disabled={task.status === status || updateTaskMutation.isPending}
                  >
                    {status === "TODO" ? "To Do" : status === "IN_PROGRESS" ? "In Progress" : "Done"}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Task Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 font-medium">Project:</span>
              <Link href={`/dashboard/projects/${task.project.id}`} className="ml-2 text-blue-600 hover:underline">
                {task.project.name}
              </Link>
            </div>
            <div>
              <span className="text-gray-600 font-medium">Due Date:</span>
              <span className="ml-2 text-gray-900">{task.dueDate ? formatDate(task.dueDate) : "Not set"}</span>
            </div>
            <div>
              <span className="text-gray-600 font-medium">Created:</span>
              <span className="ml-2 text-gray-900">{formatDateTime(task.createdAt)}</span>
            </div>
            <div>
              <span className="text-gray-600 font-medium">Updated:</span>
              <span className="ml-2 text-gray-900">{formatDateTime(task.updatedAt)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Link href={`/dashboard/projects/${task.project.id}`}>
          <Button variant="outline">← Back to Project</Button>
        </Link>
        <Link href="/dashboard/tasks">
          <Button variant="outline">← All Tasks</Button>
        </Link>
      </div>
    </div>
  );
}

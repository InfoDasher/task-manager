"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectStatusBadge, TaskStatusBadge, TaskPriorityBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  createdAt: string;
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  tasks: Task[];
  _count: { tasks: number };
}

interface ProjectResponse {
  success: boolean;
  data: Project;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const projectId = params.id as string;

  const [isEditing, setIsEditing] = useState(false);
  const [showNewTask, setShowNewTask] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState("");

  // New task state
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskStatus, setNewTaskStatus] = useState("TODO");
  const [newTaskPriority, setNewTaskPriority] = useState("MEDIUM");

  const { data, isLoading, error } = useQuery<ProjectResponse>({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}`);
      if (!res.ok) throw new Error("Failed to fetch project");
      return res.json();
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: async (data: { name?: string; description?: string; status?: string }) => {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update project");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      setIsEditing(false);
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete project");
      return res.json();
    },
    onSuccess: () => {
      router.push("/dashboard/projects");
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: { title: string; description?: string; status?: string; priority?: string }) => {
      const res = await fetch(`/api/projects/${projectId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create task");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      setShowNewTask(false);
      setNewTaskTitle("");
      setNewTaskDescription("");
      setNewTaskStatus("TODO");
      setNewTaskPriority("MEDIUM");
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete task");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    },
  });

  const handleStartEdit = () => {
    if (data?.data) {
      setEditName(data.data.name);
      setEditDescription(data.data.description || "");
      setEditStatus(data.data.status);
      setIsEditing(true);
    }
  };

  const handleSaveEdit = () => {
    updateProjectMutation.mutate({
      name: editName,
      description: editDescription || undefined,
      status: editStatus,
    });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this project? This will also delete all tasks.")) {
      deleteProjectMutation.mutate();
    }
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    createTaskMutation.mutate({
      title: newTaskTitle,
      description: newTaskDescription || undefined,
      status: newTaskStatus,
      priority: newTaskPriority,
    });
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="mt-4 text-gray-600">Loading project...</p>
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-red-600 mb-4">Project not found or failed to load.</p>
          <Link href="/dashboard/projects">
            <Button variant="outline">Back to Projects</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const project = data.data;

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            {isEditing ? (
              <div className="space-y-4 flex-1 mr-4">
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Project name" />
                <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} placeholder="Project description" rows={3} />
                <Select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  options={[
                    { value: "ACTIVE", label: "Active" },
                    { value: "ARCHIVED", label: "Archived" },
                    { value: "COMPLETED", label: "Completed" },
                  ]}
                />
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3">
                  <CardTitle className="text-2xl text-gray-900 font-bold">{project.name}</CardTitle>
                  <ProjectStatusBadge status={project.status} />
                </div>
                <CardDescription className="mt-2 text-gray-600">{project.description || "No description"}</CardDescription>
                <p className="text-sm text-gray-500 mt-2">
                  Created {formatDate(project.createdAt)} • Updated {formatDate(project.updatedAt)}
                </p>
              </div>
            )}
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button onClick={handleSaveEdit} isLoading={updateProjectMutation.isPending}>
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
                  <Button variant="destructive" onClick={handleDelete} isLoading={deleteProjectMutation.isPending}>
                    Delete
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tasks Section */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Tasks ({project.tasks.length})</h2>
        <Button onClick={() => setShowNewTask(true)}>Add Task</Button>
      </div>

      {/* New Task Form */}
      {showNewTask && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">New Task</CardTitle>
          </CardHeader>
          <form onSubmit={handleCreateTask}>
            <CardContent className="space-y-4">
              <Input placeholder="Task title" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} required />
              <Textarea placeholder="Task description (optional)" value={newTaskDescription} onChange={(e) => setNewTaskDescription(e.target.value)} rows={2} />
              <div className="grid grid-cols-2 gap-4">
                <Select
                  value={newTaskStatus}
                  onChange={(e) => setNewTaskStatus(e.target.value)}
                  options={[
                    { value: "TODO", label: "To Do" },
                    { value: "IN_PROGRESS", label: "In Progress" },
                    { value: "DONE", label: "Done" },
                  ]}
                />
                <Select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value)}
                  options={[
                    { value: "LOW", label: "Low Priority" },
                    { value: "MEDIUM", label: "Medium Priority" },
                    { value: "HIGH", label: "High Priority" },
                  ]}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" isLoading={createTaskMutation.isPending}>
                  Create Task
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowNewTask(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      )}

      {/* Tasks List */}
      {project.tasks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-600">No tasks yet. Add your first task to get started!</CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {project.tasks.map((task) => (
            <TaskCard key={task.id} task={task} onDelete={() => deleteTaskMutation.mutate(task.id)} isDeleting={deleteTaskMutation.isPending} />
          ))}
        </div>
      )}

      <div className="pt-4">
        <Link href="/dashboard/projects">
          <Button variant="outline">← Back to Projects</Button>
        </Link>
      </div>
    </div>
  );
}

function TaskCard({ task, onDelete, isDeleting }: { task: Task; onDelete: () => void; isDeleting: boolean }) {
  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Link href={`/dashboard/tasks/${task.id}`}>
                <span className="font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">{task.title}</span>
              </Link>
              <TaskStatusBadge status={task.status} />
              <TaskPriorityBadge priority={task.priority} />
            </div>
            {task.description && <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>}
            <p className="text-xs text-gray-500 mt-2">
              Created {formatDate(task.createdAt)}
              {task.dueDate && ` • Due ${formatDate(task.dueDate)}`}
            </p>
          </div>
          <div className="flex gap-2 ml-4">
            <Link href={`/dashboard/tasks/${task.id}`}>
              <Button variant="outline" size="sm">
                Edit
              </Button>
            </Link>
            <Button variant="destructive" size="sm" onClick={onDelete} isLoading={isDeleting}>
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

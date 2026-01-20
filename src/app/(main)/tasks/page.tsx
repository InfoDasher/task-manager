"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import type { TaskStatus, TaskPriority } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskStatusBadge, TaskPriorityBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { KanbanBoard } from "@/components/kanban/kanban-board";
import { FolderOpen, Circle, Loader, CheckCircle, ChevronRight, List, Columns3, Search, ExternalLink } from "lucide-react";

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
  };
}

interface DashboardStats {
  projectCount: number;
  todoCount: number;
  inProgressCount: number;
  doneCount: number;
}

type ViewMode = "list" | "kanban";
type TimeFilter = "today" | "week" | "all";

function TasksContent() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  // Fetch all tasks
  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ["all-tasks"],
    queryFn: async () => {
      const res = await fetch("/api/tasks?limit=1000");
      if (!res.ok) throw new Error("Failed to fetch tasks");
      const json = await res.json();
      return json.data as Task[];
    },
  });

  // Fetch all projects
  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ["all-projects"],
    queryFn: async () => {
      const res = await fetch("/api/projects?limit=1000");
      if (!res.ok) throw new Error("Failed to fetch projects");
      const json = await res.json();
      return json.data;
    },
  });

  // Fetch dashboard stats
  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const res = await fetch("/api/tasks?limit=1000");
      if (!res.ok) throw new Error("Failed to fetch stats");
      const json = await res.json();
      const tasks = json.data as Task[];

      const projectCount = new Set(tasks.map((t) => t.project.id)).size;
      const todoCount = tasks.filter((t) => t.status === "TODO").length;
      const inProgressCount = tasks.filter((t) => t.status === "IN_PROGRESS").length;
      const doneCount = tasks.filter((t) => t.status === "DONE").length;

      return { projectCount, todoCount, inProgressCount, doneCount };
    },
  });

  // Filter tasks based on all criteria
  const filteredTasks =
    tasksData?.filter((task) => {
      // Search filter
      if (search && !task.title.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }

      // Status filter
      if (statusFilter && task.status !== statusFilter) {
        return false;
      }

      // Priority filter
      if (priorityFilter && task.priority !== priorityFilter) {
        return false;
      }

      // Project filter
      if (projectFilter && task.project.id !== projectFilter) {
        return false;
      }

      // Time filter
      if (timeFilter === "today") {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const taskDate = new Date(task.updatedAt);
        if (taskDate < today) return false;
      } else if (timeFilter === "week") {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const taskDate = new Date(task.updatedAt);
        if (taskDate < weekAgo) return false;
      }

      return true;
    }) || [];

  // Group tasks by project
  const tasksByProject: Record<string, Task[]> = {};
  filteredTasks.forEach((task) => {
    if (!tasksByProject[task.project.id]) {
      tasksByProject[task.project.id] = [];
    }
    tasksByProject[task.project.id].push(task);
  });

  const isLoading = tasksLoading || projectsLoading;

  // Get filter description for display
  const getFilterDescription = () => {
    const parts = [];
    if (timeFilter === "today") parts.push("updated today");
    else if (timeFilter === "week") parts.push("updated this week");
    if (statusFilter) parts.push(`status: ${statusFilter.replace("_", " ").toLowerCase()}`);
    if (priorityFilter) parts.push(`priority: ${priorityFilter.toLowerCase()}`);
    if (projectFilter) {
      const project = projectsData?.find((p: any) => p.id === projectFilter);
      if (project) parts.push(`project: ${project.name}`);
    }
    if (search) parts.push(`matching "${search}"`);
    return parts.length > 0 ? `Showing ${filteredTasks.length} tasks ${parts.join(", ")}` : `Showing all ${filteredTasks.length} tasks`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tasks</h1>
          <p className="text-muted-foreground mt-1">{getFilterDescription()}</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Link href="/projects">
          <div className="flex items-center justify-between p-3 rounded-lg border border-card-border bg-card hover:border-primary/50 hover:bg-accent transition-all cursor-pointer group">
            <div className="flex items-center gap-2.5">
              <FolderOpen className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="text-sm font-medium text-foreground">{stats?.projectCount || 0} Projects</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-primary transition-colors">
              <span>View all</span>
              <ChevronRight className="h-3 w-3" />
            </div>
          </div>
        </Link>

        <button
          onClick={() => setStatusFilter(statusFilter === "TODO" ? "" : "TODO")}
          className={`group flex items-center justify-between p-3 rounded-lg border bg-card transition-all cursor-pointer text-left ${statusFilter === "TODO" ? "border-primary bg-primary/5" : "border-card-border hover:border-primary/50 hover:bg-accent"}`}
        >
          <div className="flex items-center gap-2.5">
            <Circle className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="text-sm font-medium text-foreground">{stats?.todoCount || 0} To Do</span>
          </div>
          <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">{statusFilter === "TODO" ? "Clear" : "Filter"}</span>
        </button>

        <button
          onClick={() => setStatusFilter(statusFilter === "IN_PROGRESS" ? "" : "IN_PROGRESS")}
          className={`group flex items-center justify-between p-3 rounded-lg border bg-card transition-all cursor-pointer text-left ${statusFilter === "IN_PROGRESS" ? "border-primary bg-primary/5" : "border-card-border hover:border-primary/50 hover:bg-accent"}`}
        >
          <div className="flex items-center gap-2.5">
            <Loader className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="text-sm font-medium text-foreground">{stats?.inProgressCount || 0} In Progress</span>
          </div>
          <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">{statusFilter === "IN_PROGRESS" ? "Clear" : "Filter"}</span>
        </button>

        <button
          onClick={() => setStatusFilter(statusFilter === "DONE" ? "" : "DONE")}
          className={`group flex items-center justify-between p-3 rounded-lg border bg-card transition-all cursor-pointer text-left ${statusFilter === "DONE" ? "border-primary bg-primary/5" : "border-card-border hover:border-primary/50 hover:bg-accent"}`}
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="text-sm font-medium text-foreground">{stats?.doneCount || 0} Completed</span>
          </div>
          <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">{statusFilter === "DONE" ? "Clear" : "Filter"}</span>
        </button>
      </div>

      {/* View Toggle and Time Filters */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">View:</span>
          <div className="inline-flex rounded-lg border border-card-border p-1 gap-1">
            <button
              onClick={() => setViewMode("list")}
              className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === "list" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`}
            >
              <List className="w-4 h-4 mr-1.5" />
              List
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === "kanban" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`}
            >
              <Columns3 className="w-4 h-4 mr-1.5" />
              Kanban
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Time:</span>
          <div className="inline-flex rounded-lg border border-card-border p-1 gap-1">
            <button
              onClick={() => setTimeFilter("today")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${timeFilter === "today" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`}
            >
              Today
            </button>
            <button
              onClick={() => setTimeFilter("week")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${timeFilter === "week" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`}
            >
              This Week
            </button>
            <button
              onClick={() => setTimeFilter("all")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${timeFilter === "all" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`}
            >
              All Time
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9" />
            </div>
            <Select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              options={
                projectsData?.map((p: any) => ({
                  value: p.id,
                  label: p.name,
                })) || []
              }
              placeholder="All Projects"
              className="w-40"
            />
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: "TODO", label: "To Do" },
                { value: "IN_PROGRESS", label: "In Progress" },
                { value: "DONE", label: "Done" },
              ]}
              placeholder="All Statuses"
              className="w-40"
            />
            <Select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              options={[
                { value: "LOW", label: "Low" },
                { value: "MEDIUM", label: "Medium" },
                { value: "HIGH", label: "High" },
              ]}
              placeholder="All Priorities"
              className="w-40"
            />
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading tasks...</p>
        </div>
      ) : viewMode === "list" ? (
        // List View - Grouped by Project
        <div className="space-y-6">
          {Object.keys(tasksByProject).length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">No tasks found matching your filters.</p>
              </CardContent>
            </Card>
          ) : (
            Object.entries(tasksByProject).map(([projectId, tasks]) => {
              const project = projectsData?.find((p: any) => p.id === projectId);
              return (
                <Card key={projectId}>
                  <div className="flex items-center justify-between px-4 py-3 border-b border-card-border bg-accent/30">
                    <Link href={`/projects/${projectId}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                      <FolderOpen className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold text-foreground">{project?.name || "Unknown Project"}</span>
                    </Link>
                    <span className="text-xs text-muted-foreground bg-card px-2 py-0.5 rounded-full border border-card-border">{tasks.length}</span>
                  </div>
                  <CardContent className="pt-3">
                    <div className="space-y-2">
                      {tasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-start justify-between p-3 rounded-lg border border-card-border border-l-4 border-l-primary hover:bg-accent hover:border-card-border-hover hover:border-l-primary transition-all"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Link href={`/tasks/${task.id}`}>
                                <span className="font-medium text-foreground hover:text-primary cursor-pointer">{task.title}</span>
                              </Link>
                              <TaskStatusBadge status={task.status} />
                              <TaskPriorityBadge priority={task.priority} />
                            </div>
                            {task.description && <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{task.description}</p>}
                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground/70">
                              <span>{formatDate(task.createdAt)}</span>
                              {task.dueDate && <span className="text-muted-foreground">Due {formatDate(task.dueDate)}</span>}
                            </div>
                          </div>
                          <Link href={`/tasks/${task.id}`} className="ml-3 shrink-0">
                            <Button variant="outline" size="sm">
                              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                              View
                            </Button>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      ) : (
        // Kanban View
        <Card>
          <CardContent className="pt-6">
            {filteredTasks.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground mb-4">No tasks found matching your filters.</p>
              </div>
            ) : (
              <KanbanBoard tasks={filteredTasks as any} projectId="all" />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function TasksLoading() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Tasks</h1>
        <p className="text-muted-foreground mt-1">All tasks across all projects with advanced filtering</p>
      </div>
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

export default function TasksPage() {
  return (
    <Suspense fallback={<TasksLoading />}>
      <TasksContent />
    </Suspense>
  );
}

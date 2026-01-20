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

interface Project {
  id: string;
  name: string;
  tasks: Task[];
}

interface DashboardStats {
  projectCount: number;
  todoCount: number;
  inProgressCount: number;
  doneCount: number;
}

type ViewMode = "list" | "kanban";
type TimeFilter = "today" | "week" | "all";

function DemoContent() {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Demo Dashboard</h1>
          <p className="text-muted-foreground mt-1">All tasks across all projects with advanced filtering</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="cursor-pointer hover:shadow-md hover:border-blue-500/50 transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Projects</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats?.projectCount || 0}</div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md hover:border-card-border-hover transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">To Do</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 text-muted-foreground"
            >
              <circle cx="12" cy="12" r="10" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats?.todoCount || 0}</div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md hover:border-yellow-500/50 transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 text-yellow-500"
            >
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats?.inProgressCount || 0}</div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md hover:border-green-500/50 transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 text-green-500"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22,4 12,14.01 9,11.01" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats?.doneCount || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* View Toggle and Time Filters */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">View:</span>
          <div className="inline-flex rounded-lg border border-card-border p-1">
            <Button variant={viewMode === "list" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("list")} className="rounded-md">
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              List
            </Button>
            <Button variant={viewMode === "kanban" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("kanban")} className="rounded-md">
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                />
              </svg>
              Kanban
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Time:</span>
          <div className="inline-flex rounded-lg border border-card-border p-1">
            <Button variant={timeFilter === "today" ? "default" : "ghost"} size="sm" onClick={() => setTimeFilter("today")} className="rounded-md">
              Today
            </Button>
            <Button variant={timeFilter === "week" ? "default" : "ghost"} size="sm" onClick={() => setTimeFilter("week")} className="rounded-md">
              This Week
            </Button>
            <Button variant={timeFilter === "all" ? "default" : "ghost"} size="sm" onClick={() => setTimeFilter("all")} className="rounded-md">
              All Time
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto_auto]">
            <Input placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full" />
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
                  <CardHeader className="bg-accent/50">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">
                        <Link href={`/dashboard/projects/${projectId}`} className="hover:text-primary">
                          📁 {project?.name || "Unknown Project"}
                        </Link>
                      </CardTitle>
                      <span className="text-sm text-muted-foreground">{tasks.length} tasks</span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      {tasks.map((task) => (
                        <div key={task.id} className="flex items-start justify-between p-3 rounded-lg border border-card-border hover:bg-accent hover:border-card-border-hover transition-all">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Link href={`/dashboard/tasks/${task.id}`}>
                                <span className="font-semibold text-foreground hover:text-primary cursor-pointer">{task.title}</span>
                              </Link>
                              <TaskStatusBadge status={task.status} />
                              <TaskPriorityBadge priority={task.priority} />
                            </div>
                            {task.description && <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{task.description}</p>}
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>Created {formatDate(task.createdAt)}</span>
                              <span>Updated {formatDate(task.updatedAt)}</span>
                              {task.dueDate && <span>Due {formatDate(task.dueDate)}</span>}
                            </div>
                          </div>
                          <Link href={`/dashboard/tasks/${task.id}`}>
                            <Button variant="outline" size="sm">
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

function DemoLoading() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Demo Dashboard</h1>
        <p className="text-muted-foreground mt-1">All tasks across all projects with advanced filtering</p>
      </div>
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

export default function DemoPage() {
  return (
    <Suspense fallback={<DemoLoading />}>
      <DemoContent />
    </Suspense>
  );
}

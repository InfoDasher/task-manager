"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { TaskStatusBadge, TaskPriorityBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  createdAt: string;
  project: {
    id: string;
    name: string;
  };
}

interface TasksResponse {
  success: boolean;
  data: Task[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function TasksPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery<TasksResponse>({
    queryKey: ["tasks", { search, status, priority, page }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", "10");
      if (search) params.set("search", search);
      if (status) params.set("status", status);
      if (priority) params.set("priority", priority);

      const res = await fetch(`/api/tasks?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch tasks");
      return res.json();
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600 mt-1">View and manage all your tasks across projects</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="grid gap-3 sm:grid-cols-[minmax(280px,1fr)_10rem_10rem_auto]">
            <div className="min-w-[240px]">
              <Input placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full" />
            </div>
            <Select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              options={[
                { value: "TODO", label: "To Do" },
                { value: "IN_PROGRESS", label: "In Progress" },
                { value: "DONE", label: "Done" },
              ]}
              placeholder="All Statuses"
              className="w-full"
            />
            <Select
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value);
                setPage(1);
              }}
              options={[
                { value: "LOW", label: "Low" },
                { value: "MEDIUM", label: "Medium" },
                { value: "HIGH", label: "High" },
              ]}
              placeholder="All Priorities"
              className="w-full"
            />
            <Button type="submit" variant="outline" className="w-full sm:w-auto">
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Tasks List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading tasks...</p>
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-12 text-center text-red-600">Failed to load tasks. Please try again.</CardContent>
        </Card>
      ) : data?.data.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600 mb-4">No tasks found.</p>
            <Link href="/dashboard/projects">
              <Button>Go to Projects to create tasks</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {data?.data.map((task) => (
            <Card key={task.id} className="hover:border-blue-300 transition-colors">
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
                    {task.description && <p className="text-sm text-gray-600 line-clamp-2 mb-2">{task.description}</p>}
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <Link href={`/dashboard/projects/${task.project.id}`} className="hover:text-blue-600">
                        📁 {task.project.name}
                      </Link>
                      <span>Created {formatDate(task.createdAt)}</span>
                      {task.dueDate && <span>Due {formatDate(task.dueDate)}</span>}
                    </div>
                  </div>
                  <Link href={`/dashboard/tasks/${task.id}`}>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {data.pagination.page} of {data.pagination.totalPages}
          </span>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))} disabled={page === data.pagination.totalPages}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

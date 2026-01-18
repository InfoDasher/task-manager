"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectStatusBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  _count: { tasks: number };
}

interface ProjectsResponse {
  success: boolean;
  data: Project[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function ProjectsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery<ProjectsResponse>({
    queryKey: ["projects", { search, status, page }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", "10");
      if (search) params.set("search", search);
      if (status) params.set("status", status);

      const res = await fetch(`/api/projects?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch projects");
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
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-1">Manage your projects and tasks</p>
        </div>
        <Link href="/dashboard/projects/new">
          <Button>New Project</Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 min-w-0">
              <Input placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full" />
            </div>
            <Select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              options={[
                { value: "ACTIVE", label: "Active" },
                { value: "ARCHIVED", label: "Archived" },
                { value: "COMPLETED", label: "Completed" },
              ]}
              placeholder="All Statuses"
              className="w-full sm:w-48"
            />
            <Button type="submit" variant="outline">
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Projects List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading projects...</p>
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-12 text-center text-red-600">Failed to load projects. Please try again.</CardContent>
        </Card>
      ) : data?.data.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600 mb-4">No projects found.</p>
            <Link href="/dashboard/projects/new">
              <Button>Create your first project</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data?.data.map((project) => (
            <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
              <Card className="h-full hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg text-gray-900 font-semibold">{project.name}</CardTitle>
                    <ProjectStatusBadge status={project.status} />
                  </div>
                  <CardDescription className="line-clamp-2 text-gray-600">{project.description || "No description"}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>
                      {project._count.tasks} task{project._count.tasks !== 1 ? "s" : ""}
                    </span>
                    <span>Created {formatDate(project.createdAt)}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
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

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X } from "lucide-react";

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setIsLoading(true);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description: description || undefined, status }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          setFieldErrors(data.errors);
        } else {
          setError(data.error || "Failed to create project");
        }
        return;
      }

      router.push(`/projects/${data.data.id}`);
      router.refresh();
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Create New Project</CardTitle>
          <CardDescription className="text-sm">Add a new project to organize your tasks</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && <div className="p-3 text-sm text-destructive bg-[var(--badge-red-bg)] border border-destructive/30 rounded-md">{error}</div>}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-foreground">
                Project Name *
              </label>
              <Input id="name" placeholder="My Awesome Project" value={name} onChange={(e) => setName(e.target.value)} required error={fieldErrors.name?.[0]} />
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium text-foreground">
                Description
              </label>
              <Textarea id="description" placeholder="Describe your project..." value={description} onChange={(e) => setDescription(e.target.value)} rows={4} error={fieldErrors.description?.[0]} />
            </div>
            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium text-foreground">
                Status
              </label>
              <Select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                options={[
                  { value: "ACTIVE", label: "Active" },
                  { value: "ARCHIVED", label: "Archived" },
                  { value: "COMPLETED", label: "Completed" },
                ]}
              />
            </div>
            <div className="flex gap-4 pt-4">
              <Button type="submit" isLoading={isLoading}>
                <Plus className="h-4 w-4 mr-1.5" />
                Create Project
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                <X className="h-4 w-4 mr-1.5" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}

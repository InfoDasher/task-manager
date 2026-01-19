"use client";

import { useState, useCallback, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { TaskStatus, TaskPriority } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { TaskPriorityBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  createdAt: string;
}

interface KanbanBoardProps {
  tasks: Task[];
  projectId: string;
}

interface Column {
  id: TaskStatus;
  title: string;
  color: string;
  bgColor: string;
}

const columns: Column[] = [
  { id: "TODO", title: "To Do", color: "bg-gray-500", bgColor: "bg-gray-50 dark:bg-gray-900/50" },
  { id: "IN_PROGRESS", title: "In Progress", color: "bg-yellow-500", bgColor: "bg-yellow-50 dark:bg-yellow-900/20" },
  { id: "DONE", title: "Done", color: "bg-green-500", bgColor: "bg-green-50 dark:bg-green-900/20" },
];

export function KanbanBoard({ tasks, projectId }: KanbanBoardProps) {
  const queryClient = useQueryClient();
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);
  const [error, setError] = useState<string | null>(null);
  const [pendingTaskId, setPendingTaskId] = useState<string | null>(null);

  // Sync local tasks with props when they change (e.g., after a refetch)
  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: TaskStatus }) => {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update task");
      }
      return res.json();
    },
    onSuccess: () => {
      // Clear any error on success
      setError(null);
      setPendingTaskId(null);
      // Invalidate to sync with server
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    },
    onError: (err: Error) => {
      // Revert the optimistic update
      setLocalTasks(tasks);
      setPendingTaskId(null);
      // Show elegant error message
      setError(`Failed to move task: ${err.message}. The board has been reverted.`);
      // Auto-dismiss error after 5 seconds
      setTimeout(() => setError(null), 5000);
    },
  });

  const getTasksByStatus = useCallback(
    (status: TaskStatus) => {
      return localTasks
        .filter((task) => task.status === status)
        .sort((a, b) => {
          // Sort by priority (HIGH > MEDIUM > LOW), then by createdAt
          const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
          const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
          if (priorityDiff !== 0) return priorityDiff;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    },
    [localTasks],
  );

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Dropped outside a column
    if (!destination) return;

    // Dropped in the same position
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const newStatus = destination.droppableId as TaskStatus;
    const taskId = draggableId;

    // Find the task
    const task = localTasks.find((t) => t.id === taskId);
    if (!task) return;

    // If status hasn't changed, just reorder (we don't persist order)
    if (task.status === newStatus) return;

    // Optimistic update
    setPendingTaskId(taskId);
    setLocalTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));

    // Persist to server
    updateTaskMutation.mutate({ taskId, status: newStatus });
  };

  return (
    <div className="space-y-4">
      {/* Error Toast */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium">{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {columns.map((column) => (
            <div key={column.id} className={`rounded-lg ${column.bgColor} p-4 min-h-[400px]`}>
              {/* Column Header */}
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-3 h-3 rounded-full ${column.color}`} />
                <h3 className="font-semibold text-foreground">{column.title}</h3>
                <span className="ml-auto text-sm text-muted-foreground bg-background/80 dark:bg-gray-800/80 px-2 py-0.5 rounded-full">{getTasksByStatus(column.id).length}</span>
              </div>

              {/* Droppable Area */}
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`space-y-3 min-h-[300px] transition-colors duration-200 rounded-lg p-2 ${snapshot.isDraggingOver ? "bg-primary/10 ring-2 ring-primary/30 ring-inset" : ""}`}
                  >
                    {getTasksByStatus(column.id).map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`transition-all duration-200 ${snapshot.isDragging ? "rotate-2 scale-105" : ""} ${pendingTaskId === task.id ? "opacity-70 animate-pulse" : ""}`}
                          >
                            <KanbanCard task={task} isPending={pendingTaskId === task.id} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}

                    {/* Empty State */}
                    {getTasksByStatus(column.id).length === 0 && !snapshot.isDraggingOver && (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        <p>No tasks</p>
                        <p className="text-xs mt-1">Drag tasks here</p>
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}

function KanbanCard({ task, isPending }: { task: Task; isPending: boolean }) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE";

  return (
    <Card className={`cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow ${isPending ? "border-primary/50" : ""}`}>
      <CardContent className="p-3 space-y-2">
        <Link href={`/dashboard/tasks/${task.id}`}>
          <span className="font-medium text-foreground hover:text-primary transition-colors line-clamp-2 block">{task.title}</span>
        </Link>

        {task.description && <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>}

        <div className="flex flex-wrap items-center gap-1.5">
          <TaskPriorityBadge priority={task.priority} />
          {task.dueDate && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${isOverdue ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" : "bg-muted text-muted-foreground"}`}>
              {isOverdue && "⚠ "}
              {formatDate(task.dueDate)}
            </span>
          )}
        </div>

        {/* Pending indicator */}
        {isPending && (
          <div className="flex items-center gap-1 text-xs text-primary">
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span>Updating...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TaskStatusBadge, TaskPriorityBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

type TaskStatusCount = { status: string; _count: number };

type RecentTask = {
  id: string;
  title: string;
  status: string;
  priority: string;
  updatedAt: Date;
  project: { id: string; name: string };
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch dashboard stats and recent tasks
  const [projectCount, taskStats, recentTasks] = await Promise.all([
    prisma.project.count({
      where: { userId: session.user.id },
    }),
    prisma.task.groupBy({
      by: ["status"],
      where: {
        project: { userId: session.user.id },
      },
      _count: true,
    }),
    prisma.task.findMany({
      where: {
        project: { userId: session.user.id },
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: {
        project: { select: { id: true, name: true } },
      },
    }),
  ]);

  const todoCount = (taskStats as TaskStatusCount[]).find((s) => s.status === "TODO")?._count || 0;
  const inProgressCount = (taskStats as TaskStatusCount[]).find((s) => s.status === "IN_PROGRESS")?._count || 0;
  const doneCount = (taskStats as TaskStatusCount[]).find((s) => s.status === "DONE")?._count || 0;
  const totalTasks = todoCount + inProgressCount + doneCount;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {session.user.name || session.user.email}!</p>
        </div>
        <Link href="/dashboard/projects/new">
          <Button>New Project</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/dashboard/projects">
          <Card className="cursor-pointer hover:shadow-md hover:border-blue-200 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Total Projects</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 text-gray-500"
              >
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{projectCount}</div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/tasks?status=TODO">
          <Card className="cursor-pointer hover:shadow-md hover:border-gray-300 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">To Do</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 text-gray-500"
              >
                <circle cx="12" cy="12" r="10" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{todoCount}</div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/tasks?status=IN_PROGRESS">
          <Card className="cursor-pointer hover:shadow-md hover:border-yellow-200 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">In Progress</CardTitle>
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
              <div className="text-3xl font-bold text-gray-900">{inProgressCount}</div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/tasks?status=DONE">
          <Card className="cursor-pointer hover:shadow-md hover:border-green-200 transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Completed</CardTitle>
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
              <div className="text-3xl font-bold text-gray-900">{doneCount}</div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Tasks */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl text-gray-900">Recent Tasks</CardTitle>
          <Link href="/dashboard/tasks">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentTasks.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No tasks yet. Create a project and add some tasks!</p>
          ) : (
            <div className="space-y-3">
              {(recentTasks as RecentTask[]).map((task) => (
                <Link key={task.id} href={`/dashboard/tasks/${task.id}`} className="block">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 hover:border-gray-200 transition-all">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 truncate">{task.title}</span>
                        <TaskStatusBadge status={task.status} />
                        <TaskPriorityBadge priority={task.priority} />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {task.project.name} • Updated {formatDate(task.updatedAt)}
                      </p>
                    </div>
                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-gray-900">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Link href="/dashboard/projects">
            <Button variant="outline">View All Projects</Button>
          </Link>
          <Link href="/dashboard/tasks">
            <Button variant="outline">View All Tasks</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

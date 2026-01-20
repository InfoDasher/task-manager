import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { updateTaskSchema } from "@/lib/validations";
import { successResponse, errorResponse } from "@/lib/utils";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/tasks/[id] - Get a single task
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
    }

    const { id } = await params;

    const task = await prisma.task.findFirst({
      where: {
        id,
        project: {
          userId: session.user.id, // Ownership enforcement
        },
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    });

    if (!task) {
      return NextResponse.json(errorResponse("Task not found"), {
        status: 404,
      });
    }

    return NextResponse.json(successResponse(task));
  } catch (error) {
    console.error("Get task error:", error);
    return NextResponse.json(errorResponse("An unexpected error occurred"), {
      status: 500,
    });
  }
}

// PUT /api/tasks/[id] - Update a task
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Validate input
    const parsed = updateTaskSchema.safeParse(body);
    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      return NextResponse.json(errorResponse("Validation failed", errors as Record<string, string[]>), { status: 400 });
    }

    // Check ownership through project
    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        project: {
          userId: session.user.id,
        },
      },
    });

    if (!existingTask) {
      return NextResponse.json(errorResponse("Task not found"), {
        status: 404,
      });
    }

    // If changing project, verify ownership of the new project
    if (parsed.data.projectId && parsed.data.projectId !== existingTask.projectId) {
      const newProject = await prisma.project.findFirst({
        where: {
          id: parsed.data.projectId,
          userId: session.user.id,
        },
      });
      if (!newProject) {
        return NextResponse.json(errorResponse("Target project not found"), {
          status: 404,
        });
      }
    }

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...parsed.data,
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : parsed.data.dueDate,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(successResponse(task));
  } catch (error) {
    console.error("Update task error:", error);
    return NextResponse.json(errorResponse("An unexpected error occurred"), {
      status: 500,
    });
  }
}

// DELETE /api/tasks/[id] - Delete a task
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
    }

    const { id } = await params;

    // Check ownership through project
    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        project: {
          userId: session.user.id,
        },
      },
    });

    if (!existingTask) {
      return NextResponse.json(errorResponse("Task not found"), {
        status: 404,
      });
    }

    await prisma.task.delete({
      where: { id },
    });

    return NextResponse.json(successResponse({ message: "Task deleted" }));
  } catch (error) {
    console.error("Delete task error:", error);
    return NextResponse.json(errorResponse("An unexpected error occurred"), {
      status: 500,
    });
  }
}

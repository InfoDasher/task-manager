import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createTaskSchema } from "@/lib/validations";
import { successResponse, errorResponse } from "@/lib/utils";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/projects/[id]/tasks - Create a task for a project (RESTful nested endpoint)
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
    }

    const { id: projectId } = await params;
    const body = await request.json();

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id,
      },
    });

    if (!project) {
      return NextResponse.json(errorResponse("Project not found"), {
        status: 404,
      });
    }

    // Validate input (override projectId from URL)
    const parsed = createTaskSchema.safeParse({ ...body, projectId });
    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      return NextResponse.json(errorResponse("Validation failed", errors as Record<string, string[]>), { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        status: parsed.data.status,
        priority: parsed.data.priority,
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
        projectId,
      },
    });

    return NextResponse.json(successResponse(task), { status: 201 });
  } catch (error) {
    console.error("Create task error:", error);
    return NextResponse.json(errorResponse("An unexpected error occurred"), {
      status: 500,
    });
  }
}

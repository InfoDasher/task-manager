import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createTaskSchema, taskQuerySchema } from "@/lib/validations";
import { successResponse, errorResponse, paginationMeta } from "@/lib/utils";

// GET /api/tasks - List all tasks with pagination, search, and filtering
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    // Validate query parameters
    const parsed = taskQuerySchema.safeParse(queryParams);
    if (!parsed.success) {
      console.error("Task query validation failed:", JSON.stringify(parsed.error.issues));
      return NextResponse.json(errorResponse("Invalid query parameters", parsed.error.flatten().fieldErrors as Record<string, string[]>), { status: 400 });
    }

    const { page, limit, search, status, priority, projectId, sortBy, sortOrder } = parsed.data;
    const skip = (page - 1) * limit;

    // Build where clause with ownership enforcement via project
    const where = {
      project: {
        userId: session.user.id, // Ownership enforcement through project
      },
      ...(status && { status }),
      ...(priority && { priority }),
      ...(projectId && { projectId }),
      ...(search && {
        OR: [{ title: { contains: search, mode: "insensitive" as const } }, { description: { contains: search, mode: "insensitive" as const } }],
      }),
    };

    // Execute queries in parallel
    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.task.count({ where }),
    ]);

    return NextResponse.json(successResponse(tasks, paginationMeta(total, page, limit)));
  } catch (error) {
    console.error("Get tasks error:", error);
    return NextResponse.json(errorResponse("An unexpected error occurred"), { status: 500 });
  }
}

// POST /api/tasks - Create a new task (standalone endpoint)
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
    }

    const body = await request.json();

    // Validate input
    const parsed = createTaskSchema.safeParse(body);
    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      return NextResponse.json(errorResponse("Validation failed", errors as Record<string, string[]>), { status: 400 });
    }

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: {
        id: parsed.data.projectId,
        userId: session.user.id,
      },
    });

    if (!project) {
      return NextResponse.json(errorResponse("Project not found"), {
        status: 404,
      });
    }

    const task = await prisma.task.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        status: parsed.data.status,
        priority: parsed.data.priority,
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
        projectId: parsed.data.projectId,
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

    return NextResponse.json(successResponse(task), { status: 201 });
  } catch (error) {
    console.error("Create task error:", error);
    return NextResponse.json(errorResponse("An unexpected error occurred"), { status: 500 });
  }
}

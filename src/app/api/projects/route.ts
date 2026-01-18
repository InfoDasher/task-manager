import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createProjectSchema, projectQuerySchema } from "@/lib/validations";
import { successResponse, errorResponse, paginationMeta } from "@/lib/utils";

// GET /api/projects - List all projects with pagination, search, and filtering
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    // Validate query parameters
    const parsed = projectQuerySchema.safeParse(queryParams);
    if (!parsed.success) {
      return NextResponse.json(errorResponse("Invalid query parameters"), { status: 400 });
    }

    const { page, limit, search, status, sortBy, sortOrder } = parsed.data;
    const skip = (page - 1) * limit;

    // Build where clause with ownership enforcement
    const where = {
      userId: session.user.id,
      ...(status && { status }),
      ...(search && {
        OR: [{ name: { contains: search, mode: "insensitive" as const } }, { description: { contains: search, mode: "insensitive" as const } }],
      }),
    };

    // Execute queries in parallel
    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: { tasks: true },
          },
        },
      }),
      prisma.project.count({ where }),
    ]);

    return NextResponse.json(successResponse(projects, paginationMeta(total, page, limit)));
  } catch (error) {
    console.error("Get projects error:", error);
    return NextResponse.json(errorResponse("An unexpected error occurred"), { status: 500 });
  }
}

// POST /api/projects - Create a new project
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
    }

    const body = await request.json();

    // Validate input
    const parsed = createProjectSchema.safeParse(body);
    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      return NextResponse.json(errorResponse("Validation failed", errors as Record<string, string[]>), { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        ...parsed.data,
        userId: session.user.id,
      },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    });

    return NextResponse.json(successResponse(project), { status: 201 });
  } catch (error) {
    console.error("Create project error:", error);
    return NextResponse.json(errorResponse("An unexpected error occurred"), { status: 500 });
  }
}

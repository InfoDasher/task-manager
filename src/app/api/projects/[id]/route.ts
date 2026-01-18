import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { updateProjectSchema } from "@/lib/validations";
import { successResponse, errorResponse } from "@/lib/utils";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/projects/[id] - Get a single project with its tasks
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
    }

    const { id } = await params;

    const project = await prisma.project.findFirst({
      where: {
        id,
        userId: session.user.id, // Ownership enforcement
      },
      include: {
        tasks: {
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: { tasks: true },
        },
      },
    });

    if (!project) {
      return NextResponse.json(errorResponse("Project not found"), {
        status: 404,
      });
    }

    return NextResponse.json(successResponse(project));
  } catch (error) {
    console.error("Get project error:", error);
    return NextResponse.json(errorResponse("An unexpected error occurred"), {
      status: 500,
    });
  }
}

// PUT /api/projects/[id] - Update a project
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Validate input
    const parsed = updateProjectSchema.safeParse(body);
    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      return NextResponse.json(errorResponse("Validation failed", errors as Record<string, string[]>), { status: 400 });
    }

    // Update with ownership check in a single query
    const project = await prisma.project
      .update({
        where: {
          id,
          userId: session.user.id, // Ownership enforcement
        },
        data: parsed.data,
        include: {
          _count: {
            select: { tasks: true },
          },
        },
      })
      .catch(() => null);

    if (!project) {
      return NextResponse.json(errorResponse("Project not found"), {
        status: 404,
      });
    }

    return NextResponse.json(successResponse(project));
  } catch (error) {
    console.error("Update project error:", error);
    return NextResponse.json(errorResponse("An unexpected error occurred"), {
      status: 500,
    });
  }
}

// DELETE /api/projects/[id] - Delete a project
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
    }

    const { id } = await params;

    // Delete with ownership check in a single query
    const deleted = await prisma.project
      .delete({
        where: {
          id,
          userId: session.user.id, // Ownership enforcement
        },
      })
      .catch(() => null);

    if (!deleted) {
      return NextResponse.json(errorResponse("Project not found"), {
        status: 404,
      });
    }

    return NextResponse.json(successResponse({ message: "Project deleted" }));
  } catch (error) {
    console.error("Delete project error:", error);
    return NextResponse.json(errorResponse("An unexpected error occurred"), {
      status: 500,
    });
  }
}

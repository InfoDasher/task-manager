import { describe, it, expect } from "vitest";
import { registerSchema, loginSchema, createProjectSchema, updateProjectSchema, createTaskSchema, updateTaskSchema, projectQuerySchema, taskQuerySchema } from "./validations";

describe("Auth Schemas", () => {
  describe("registerSchema", () => {
    it("should accept valid registration data", () => {
      const validData = {
        email: "test@example.com",
        password: "password123",
        name: "John Doe",
      };
      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept registration without optional name", () => {
      const validData = {
        email: "test@example.com",
        password: "password123",
      };
      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid email", () => {
      const invalidData = {
        email: "not-an-email",
        password: "password123",
      };
      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.email).toBeDefined();
      }
    });

    it("should reject password shorter than 8 characters", () => {
      const invalidData = {
        email: "test@example.com",
        password: "short",
      };
      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.password).toContain("Password must be at least 8 characters");
      }
    });

    it("should reject password longer than 100 characters", () => {
      const invalidData = {
        email: "test@example.com",
        password: "a".repeat(101),
      };
      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject empty email", () => {
      const invalidData = {
        email: "",
        password: "password123",
      };
      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("loginSchema", () => {
    it("should accept valid login credentials", () => {
      const validData = {
        email: "test@example.com",
        password: "anypassword",
      };
      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid email", () => {
      const invalidData = {
        email: "invalid",
        password: "password",
      };
      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject empty password", () => {
      const invalidData = {
        email: "test@example.com",
        password: "",
      };
      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.password).toContain("Password is required");
      }
    });
  });
});

describe("Project Schemas", () => {
  describe("createProjectSchema", () => {
    it("should accept valid project data", () => {
      const validData = {
        name: "My Project",
        description: "A test project",
        status: "ACTIVE",
      };
      const result = createProjectSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept project without optional fields", () => {
      const validData = {
        name: "My Project",
      };
      const result = createProjectSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject empty project name", () => {
      const invalidData = {
        name: "",
      };
      const result = createProjectSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.name).toContain("Project name is required");
      }
    });

    it("should reject project name longer than 255 characters", () => {
      const invalidData = {
        name: "a".repeat(256),
      };
      const result = createProjectSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject description longer than 1000 characters", () => {
      const invalidData = {
        name: "Project",
        description: "a".repeat(1001),
      };
      const result = createProjectSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject invalid status", () => {
      const invalidData = {
        name: "Project",
        status: "INVALID_STATUS",
      };
      const result = createProjectSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should accept all valid status values", () => {
      const statuses = ["ACTIVE", "ARCHIVED", "COMPLETED"];
      statuses.forEach((status) => {
        const result = createProjectSchema.safeParse({ name: "Project", status });
        expect(result.success).toBe(true);
      });
    });
  });

  describe("updateProjectSchema", () => {
    it("should accept partial update data", () => {
      const validData = {
        name: "Updated Name",
      };
      const result = updateProjectSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept empty object (no updates)", () => {
      const result = updateProjectSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("should accept null description (to clear it)", () => {
      const validData = {
        description: null,
      };
      const result = updateProjectSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe("projectQuerySchema", () => {
    it("should apply default values", () => {
      const result = projectQuerySchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(10);
        expect(result.data.sortBy).toBe("createdAt");
        expect(result.data.sortOrder).toBe("desc");
      }
    });

    it("should coerce string page to number", () => {
      const result = projectQuerySchema.safeParse({ page: "5" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(5);
      }
    });

    it("should reject limit greater than 100", () => {
      const result = projectQuerySchema.safeParse({ limit: 101 });
      expect(result.success).toBe(false);
    });

    it("should reject negative page number", () => {
      const result = projectQuerySchema.safeParse({ page: -1 });
      expect(result.success).toBe(false);
    });

    it("should accept empty string for status filter", () => {
      const result = projectQuerySchema.safeParse({ status: "" });
      expect(result.success).toBe(true);
    });
  });
});

describe("Task Schemas", () => {
  describe("createTaskSchema", () => {
    const validProjectId = "clxxxxxxxxxxxxxxxxxxxxxxxxx"; // CUID format

    it("should accept valid task data", () => {
      const validData = {
        title: "My Task",
        description: "A test task",
        status: "TODO",
        priority: "MEDIUM",
        projectId: validProjectId,
      };
      const result = createTaskSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept task with minimal required fields", () => {
      const validData = {
        title: "My Task",
        projectId: validProjectId,
      };
      const result = createTaskSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject empty title", () => {
      const invalidData = {
        title: "",
        projectId: validProjectId,
      };
      const result = createTaskSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.title).toContain("Task title is required");
      }
    });

    it("should reject invalid projectId format", () => {
      const invalidData = {
        title: "Task",
        projectId: "invalid-id",
      };
      const result = createTaskSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.projectId).toBeDefined();
      }
    });

    it("should accept all valid status values", () => {
      const statuses = ["TODO", "IN_PROGRESS", "DONE"];
      statuses.forEach((status) => {
        const result = createTaskSchema.safeParse({
          title: "Task",
          projectId: validProjectId,
          status,
        });
        expect(result.success).toBe(true);
      });
    });

    it("should accept all valid priority values", () => {
      const priorities = ["LOW", "MEDIUM", "HIGH"];
      priorities.forEach((priority) => {
        const result = createTaskSchema.safeParse({
          title: "Task",
          projectId: validProjectId,
          priority,
        });
        expect(result.success).toBe(true);
      });
    });

    it("should accept valid ISO datetime for dueDate", () => {
      const validData = {
        title: "Task",
        projectId: validProjectId,
        dueDate: "2025-12-31T23:59:59.000Z",
      };
      const result = createTaskSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept null dueDate", () => {
      const validData = {
        title: "Task",
        projectId: validProjectId,
        dueDate: null,
      };
      const result = createTaskSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe("updateTaskSchema", () => {
    it("should accept partial update data", () => {
      const validData = {
        title: "Updated Title",
        status: "DONE",
      };
      const result = updateTaskSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept empty object", () => {
      const result = updateTaskSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("should accept null values for clearable fields", () => {
      const validData = {
        description: null,
        dueDate: null,
      };
      const result = updateTaskSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe("taskQuerySchema", () => {
    it("should apply default values", () => {
      const result = taskQuerySchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(10);
        expect(result.data.sortBy).toBe("createdAt");
        expect(result.data.sortOrder).toBe("desc");
      }
    });

    it("should accept status filter", () => {
      const result = taskQuerySchema.safeParse({ status: "TODO" });
      expect(result.success).toBe(true);
    });

    it("should accept priority filter", () => {
      const result = taskQuerySchema.safeParse({ priority: "HIGH" });
      expect(result.success).toBe(true);
    });

    it("should accept valid sortBy values", () => {
      const sortByOptions = ["createdAt", "updatedAt", "title", "dueDate", "priority"];
      sortByOptions.forEach((sortBy) => {
        const result = taskQuerySchema.safeParse({ sortBy });
        expect(result.success).toBe(true);
      });
    });

    it("should accept empty string for status filter", () => {
      const result = taskQuerySchema.safeParse({ status: "" });
      expect(result.success).toBe(true);
    });

    it("should accept empty string for priority filter", () => {
      const result = taskQuerySchema.safeParse({ priority: "" });
      expect(result.success).toBe(true);
    });

    it("should accept empty string for projectId filter", () => {
      const result = taskQuerySchema.safeParse({ projectId: "" });
      expect(result.success).toBe(true);
    });

    it("should accept all empty string filters together", () => {
      const result = taskQuerySchema.safeParse({ status: "", priority: "", projectId: "" });
      expect(result.success).toBe(true);
    });
  });
});

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge, ProjectStatusBadge, TaskStatusBadge, TaskPriorityBadge } from "./badge";

describe("Badge Component", () => {
  describe("Base Badge", () => {
    it("renders children correctly", () => {
      render(<Badge>Test Badge</Badge>);
      expect(screen.getByText("Test Badge")).toBeInTheDocument();
    });

    it("applies default variant styles", () => {
      render(<Badge>Default</Badge>);
      const badge = screen.getByText("Default");
      expect(badge).toHaveClass("bg-[var(--badge-gray-bg)]", "text-[var(--badge-gray-text)]");
    });

    it("applies success variant styles", () => {
      render(<Badge variant="success">Success</Badge>);
      const badge = screen.getByText("Success");
      expect(badge).toHaveClass("bg-[var(--badge-green-bg)]", "text-[var(--badge-green-text)]");
    });

    it("applies warning variant styles", () => {
      render(<Badge variant="warning">Warning</Badge>);
      const badge = screen.getByText("Warning");
      expect(badge).toHaveClass("bg-[var(--badge-yellow-bg)]", "text-[var(--badge-yellow-text)]");
    });

    it("applies error variant styles", () => {
      render(<Badge variant="error">Error</Badge>);
      const badge = screen.getByText("Error");
      expect(badge).toHaveClass("bg-[var(--badge-red-bg)]", "text-[var(--badge-red-text)]");
    });

    it("applies info variant styles", () => {
      render(<Badge variant="info">Info</Badge>);
      const badge = screen.getByText("Info");
      expect(badge).toHaveClass("bg-[var(--badge-blue-bg)]", "text-[var(--badge-blue-text)]");
    });

    it("accepts custom className", () => {
      render(<Badge className="custom-class">Custom</Badge>);
      const badge = screen.getByText("Custom");
      expect(badge).toHaveClass("custom-class");
    });

    it("has correct base styles", () => {
      render(<Badge>Styled</Badge>);
      const badge = screen.getByText("Styled");
      expect(badge).toHaveClass("inline-flex", "items-center", "rounded-full", "px-2.5", "py-0.5", "text-xs", "font-medium");
    });
  });

  describe("ProjectStatusBadge", () => {
    it("renders ACTIVE status with success variant", () => {
      render(<ProjectStatusBadge status="ACTIVE" />);
      const badge = screen.getByText("Active");
      expect(badge).toHaveClass("bg-[var(--badge-green-bg)]", "text-[var(--badge-green-text)]");
    });

    it("renders ARCHIVED status with warning variant", () => {
      render(<ProjectStatusBadge status="ARCHIVED" />);
      const badge = screen.getByText("Archived");
      expect(badge).toHaveClass("bg-[var(--badge-yellow-bg)]", "text-[var(--badge-yellow-text)]");
    });

    it("renders COMPLETED status with info variant", () => {
      render(<ProjectStatusBadge status="COMPLETED" />);
      const badge = screen.getByText("Completed");
      expect(badge).toHaveClass("bg-[var(--badge-blue-bg)]", "text-[var(--badge-blue-text)]");
    });

    it("formats status text correctly (capitalizes first letter)", () => {
      render(<ProjectStatusBadge status="ACTIVE" />);
      expect(screen.getByText("Active")).toBeInTheDocument();
    });

    it("handles unknown status gracefully", () => {
      render(<ProjectStatusBadge status="UNKNOWN" />);
      const badge = screen.getByText("Unknown");
      expect(badge).toHaveClass("bg-[var(--badge-gray-bg)]", "text-[var(--badge-gray-text)]");
    });
  });

  describe("TaskStatusBadge", () => {
    it("renders TODO status with default variant", () => {
      render(<TaskStatusBadge status="TODO" />);
      const badge = screen.getByText("To Do");
      expect(badge).toHaveClass("bg-[var(--badge-gray-bg)]", "text-[var(--badge-gray-text)]");
    });

    it("renders IN_PROGRESS status with warning variant", () => {
      render(<TaskStatusBadge status="IN_PROGRESS" />);
      const badge = screen.getByText("In Progress");
      expect(badge).toHaveClass("bg-[var(--badge-yellow-bg)]", "text-[var(--badge-yellow-text)]");
    });

    it("renders DONE status with success variant", () => {
      render(<TaskStatusBadge status="DONE" />);
      const badge = screen.getByText("Done");
      expect(badge).toHaveClass("bg-[var(--badge-green-bg)]", "text-[var(--badge-green-text)]");
    });

    it("displays friendly labels for statuses", () => {
      render(<TaskStatusBadge status="IN_PROGRESS" />);
      expect(screen.getByText("In Progress")).toBeInTheDocument();
    });

    it("handles unknown status gracefully", () => {
      render(<TaskStatusBadge status="UNKNOWN" />);
      const badge = screen.getByText("UNKNOWN");
      expect(badge).toHaveClass("bg-[var(--badge-gray-bg)]", "text-[var(--badge-gray-text)]");
    });
  });

  describe("TaskPriorityBadge", () => {
    it("renders LOW priority with success variant", () => {
      render(<TaskPriorityBadge priority="LOW" />);
      const badge = screen.getByText("Low");
      expect(badge).toHaveClass("bg-[var(--badge-green-bg)]", "text-[var(--badge-green-text)]");
    });

    it("renders MEDIUM priority with warning variant", () => {
      render(<TaskPriorityBadge priority="MEDIUM" />);
      const badge = screen.getByText("Medium");
      expect(badge).toHaveClass("bg-[var(--badge-yellow-bg)]", "text-[var(--badge-yellow-text)]");
    });

    it("renders HIGH priority with error variant", () => {
      render(<TaskPriorityBadge priority="HIGH" />);
      const badge = screen.getByText("High");
      expect(badge).toHaveClass("bg-[var(--badge-red-bg)]", "text-[var(--badge-red-text)]");
    });

    it("formats priority text correctly", () => {
      render(<TaskPriorityBadge priority="HIGH" />);
      expect(screen.getByText("High")).toBeInTheDocument();
    });

    it("handles unknown priority gracefully", () => {
      render(<TaskPriorityBadge priority="UNKNOWN" />);
      const badge = screen.getByText("Unknown");
      expect(badge).toHaveClass("bg-[var(--badge-gray-bg)]", "text-[var(--badge-gray-text)]");
    });
  });
});

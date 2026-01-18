"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
  onConfirm: () => void;
  isLoading?: boolean;
}

/**
 * Accessible confirmation dialog component
 * Replaces native window.confirm() with a proper modal
 */
export function ConfirmDialog({ open, onOpenChange, title, description, confirmLabel = "Confirm", cancelLabel = "Cancel", variant = "default", onConfirm, isLoading = false }: ConfirmDialogProps) {
  const overlayRef = React.useRef<HTMLDivElement>(null);
  const confirmButtonRef = React.useRef<HTMLButtonElement>(null);

  // Focus trap and escape key handling
  React.useEffect(() => {
    if (open) {
      confirmButtonRef.current?.focus();

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onOpenChange(false);
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "";
      };
    }
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={(e) => {
        if (e.target === overlayRef.current) {
          onOpenChange(false);
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 animate-in fade-in-0" />

      {/* Dialog */}
      <div className="relative z-50 w-full max-w-md bg-white rounded-lg shadow-lg p-6 animate-in zoom-in-95 fade-in-0">
        <h2 id="dialog-title" className="text-lg font-semibold text-gray-900">
          {title}
        </h2>
        <p id="dialog-description" className="mt-2 text-sm text-gray-600">
          {description}
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button
            ref={confirmButtonRef}
            variant={variant === "danger" ? "destructive" : "default"}
            onClick={() => {
              onConfirm();
            }}
            isLoading={isLoading}
            className={cn(variant === "danger" && "bg-red-600 hover:bg-red-700 focus:ring-red-500")}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

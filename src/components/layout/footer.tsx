"use client";

import { useEffect, useState } from "react";

function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function Footer() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Git info from build time environment variables
  const branch = process.env.NEXT_PUBLIC_GIT_BRANCH || "main";
  const commit = process.env.NEXT_PUBLIC_GIT_COMMIT || "dev";
  const timestamp = process.env.NEXT_PUBLIC_GIT_TIMESTAMP || new Date().toISOString();

  // Calculate relative time only on client to avoid hydration mismatch
  const relativeTime = mounted ? getRelativeTime(timestamp) : "";

  return (
    <footer className="border-t border-card-border bg-card/50 mt-auto">
      <div className="mx-auto w-full max-w-6xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <span>📌</span>
          <span className="font-medium">{branch}</span>
          <span className="text-muted-foreground/50">@</span>
          <span className="font-mono">{commit}</span>
          <span className="text-muted-foreground/50">•</span>
          <span>{relativeTime || "loading..."}</span>
          <span className="text-muted-foreground/50">•</span>
          <span>by Aaron</span>
        </div>
      </div>
    </footer>
  );
}

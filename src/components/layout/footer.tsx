"use client";

import { useEffect, useState } from "react";

interface GitInfo {
  author: string;
  branch: string;
  lastPush: string;
  commitHash: string;
}

export function Footer() {
  const [gitInfo, setGitInfo] = useState<GitInfo | null>(null);

  useEffect(() => {
    // This info is set at build time via environment variables
    const info: GitInfo = {
      author: process.env.NEXT_PUBLIC_GIT_AUTHOR || "Aaron Hayden",
      branch: process.env.NEXT_PUBLIC_GIT_BRANCH || "main",
      lastPush: process.env.NEXT_PUBLIC_GIT_TIMESTAMP || new Date().toISOString(),
      commitHash: process.env.NEXT_PUBLIC_GIT_COMMIT || "dev",
    };
    setGitInfo(info);
  }, []);

  if (!gitInfo) return null;

  const formattedDate = new Date(gitInfo.lastPush).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <footer className="border-t border-card-border bg-card/50 mt-auto">
      <div className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="font-medium">Author:</span> {gitInfo.author}
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="font-medium">Build:</span> {formattedDate}
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="font-medium">Branch:</span> {gitInfo.branch}
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
            </svg>
            <span className="font-medium">Commit:</span> {gitInfo.commitHash.slice(0, 7)}
          </span>
        </div>
      </div>
    </footer>
  );
}

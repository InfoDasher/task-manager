import type { NextConfig } from "next";
import { execSync } from "child_process";

// Get git info at build time
function getGitInfo() {
  try {
    const branch = execSync("git rev-parse --abbrev-ref HEAD", { encoding: "utf-8" }).trim();
    const commit = execSync("git rev-parse --short HEAD", { encoding: "utf-8" }).trim();
    const timestamp = execSync("git log -1 --format=%cI", { encoding: "utf-8" }).trim(); // ISO format
    return { branch, commit, timestamp };
  } catch (e) {
    console.warn("Failed to get git info:", e);
    return {
      branch: "main",
      commit: "dev",
      timestamp: new Date().toISOString(),
    };
  }
}

const gitInfo = getGitInfo();

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: "standalone",
  env: {
    NEXT_PUBLIC_GIT_BRANCH: gitInfo.branch,
    NEXT_PUBLIC_GIT_COMMIT: gitInfo.commit,
    NEXT_PUBLIC_GIT_TIMESTAMP: gitInfo.timestamp,
  },
};

export default nextConfig;

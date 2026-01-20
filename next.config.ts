import type { NextConfig } from "next";
import { execSync } from "child_process";

// Get git info at build time
function getGitInfo() {
  try {
    const branch = execSync("git rev-parse --abbrev-ref HEAD").toString().trim();
    const commit = execSync("git rev-parse HEAD").toString().trim();
    const timestamp = execSync("git log -1 --format=%ci").toString().trim();
    const author = execSync("git config user.name").toString().trim();
    return { branch, commit, timestamp, author };
  } catch {
    return {
      branch: "unknown",
      commit: "unknown",
      timestamp: new Date().toISOString(),
      author: "Unknown",
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
    NEXT_PUBLIC_GIT_AUTHOR: gitInfo.author,
  },
};

export default nextConfig;

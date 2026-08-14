import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output keeps the app deployable on plain Node.js hosts
  // (AWS Amplify Hosting, ECS/Fargate, EC2) rather than tying the build
  // to Vercel-specific infrastructure.
  output: "standalone",
};

export default nextConfig;

import type { NextConfig } from "next";
import { config } from "dotenv";
import path from "node:path";

config({ path: path.resolve(__dirname, "../../.env") });

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
};

export default nextConfig;

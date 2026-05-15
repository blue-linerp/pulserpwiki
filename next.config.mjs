import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // better-sqlite3 is only used locally now (migrate script); remove from
    // serverComponentsExternalPackages so Vercel doesn't try to bundle it.
    serverComponentsExternalPackages: [],
  },
  webpack(config) {
    config.resolve.alias["@"] = path.resolve(__dirname, "src");
    return config;
  },
};
export default nextConfig;

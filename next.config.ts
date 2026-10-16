import type { NextConfig } from "next";
const config: NextConfig = {
  serverExternalPackages: ["better-sqlite3", "sharp"],
  poweredByHeader: false,
  allowedDevOrigins: process.env.HOMEFIND_DEV_ORIGINS?.split(",").map((origin) => origin.trim()).filter(Boolean),
};
export default config;

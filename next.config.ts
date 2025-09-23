import type { NextConfig } from "next";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const json = require("./package.json");

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  publicRuntimeConfig: {
    version: json.version,
  },
};

export default nextConfig;

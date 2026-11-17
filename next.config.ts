import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  outputFileTracingIncludes: {
    "/dashboard/studies/*/pdf": [
      "./node_modules/@fontsource/poppins/files/poppins-latin-{400,600}-*.woff",
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;

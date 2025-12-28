import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack : {
    root : path.join(__dirname, "..")
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ucarecdn.com",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  // Next.js 13+ serverExternalPackages - ensures these packages are not bundled
  serverExternalPackages: ["puppeteer-core", "@sparticuz/chromium"],
  webpack: (config, { isServer }) => {
    // Exclude Puppeteer and Chromium from client-side bundle
    // These should only run on the server (Vercel serverless functions)
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
      };
    }

    // Exclude puppeteer-core and chromium from client bundle
    config.externals = config.externals || [];
    if (isServer) {
      config.externals.push({
        "puppeteer-core": "commonjs puppeteer-core",
        "@sparticuz/chromium": "commonjs @sparticuz/chromium",
      });
    }

    return config;
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ['antd', '@ant-design/icons', '@ant-design/x'],
  experimental: {
    optimizePackageImports: ['antd']
  }
};

export default nextConfig;

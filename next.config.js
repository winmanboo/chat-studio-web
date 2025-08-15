/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  transpilePackages: ['antd', '@ant-design/icons', '@ant-design/x'],
  experimental: {
    optimizePackageImports: ['antd']
  }
};

module.exports = nextConfig;

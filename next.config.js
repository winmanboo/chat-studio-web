/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  transpilePackages: ['antd', '@ant-design/icons', '@ant-design/x'],
  experimental: {
    optimizePackageImports: ['antd']
  },
  // 移除rewrites，改用API路由处理代理以支持流式传输
  // async rewrites() {
  //   return [
  //     {
  //       source: '/api/:path*',
  //       destination: 'http://localhost:8080/:path*',
  //     },
  //   ];
  // },
};

module.exports = nextConfig;

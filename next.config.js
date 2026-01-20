/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  transpilePackages: ['antd', '@ant-design/icons', '@ant-design/x'],
  experimental: {
    optimizePackageImports: ['antd']
  },
  // 使用混合代理方案：
  // - 流式接口（/api/chat/*）使用 API 路由处理，支持 SSE
  // - 其他接口使用 rewrites 代理，性能更好
  async rewrites() {
    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:8080';
    
    return [
      {
        // 捕获所有 /api/ 开头的请求
        source: '/api/:path*',
        // 转发到后端对应路径
        destination: `${backendUrl}/:path*`,
      }
    ];
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/chat',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
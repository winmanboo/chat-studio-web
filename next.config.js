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
    
    // 创建代理配置的辅助函数
    const createProxyRule = (apiPath) => ({
      source: `/api/${apiPath}/:path*`,
      destination: `${backendUrl}/${apiPath}/:path*`,
    });

    // 需要代理的 API 路径列表
    const apiPaths = [
      'models',
      'auth', 
      'doc',
      'kb',
      'admin',
      'dict',
      'tags',
      'session'
    ];

    return apiPaths.map(createProxyRule);
  },
};

module.exports = nextConfig;
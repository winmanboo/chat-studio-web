import request from './request';

// MCP 服务器状态枚举
export enum MCPServerState {
  HEALTH = 'HEALTH',
  FAIL = 'FAIL'
}

// MCP 服务器数据接口（根据新的接口规范调整）
export interface MCPServer {
  endpoint: string;
  serverName: string;
  bizName: string;
  timeout: number;
  sseTimeout: number;
  state: MCPServerState;
  description: string | null;
  shared: boolean;
}

// 创建 MCP 服务器的请求参数
export interface CreateMCPServerRequest {
  endpoint: string;
  serverName: string;
  bizName: string;
  timeout?: number;
  sseTimeout?: number;
  description?: string;
  shared?: boolean;
}

// 更新 MCP 服务器的请求参数
export interface UpdateMCPServerRequest {
  endpoint: string;
  serverName?: string;
  bizName?: string;
  timeout?: number;
  sseTimeout?: number;
  description?: string;
  shared?: boolean;
}

// MCP 服务器列表查询参数
export interface MCPServerListParams {
  serverName?: string;
  bizName?: string;
  state?: MCPServerState;
  shared?: boolean;
}

/**
 * 获取 MCP 服务器列表
 */
export const getMCPServerList = async (params?: MCPServerListParams): Promise<MCPServer[]> => {
  return await request.get('/mcp/list', { params });
};

/**
 * 获取单个 MCP 服务器详情
 */
export const getMCPServer = async (endpoint: string): Promise<MCPServer> => {
  return await request.get(`/mcp/server`, { params: { endpoint } });
};

/**
 * 创建 MCP 服务器
 */
export const createMCPServer = async (data: CreateMCPServerRequest): Promise<MCPServer> => {
  return await request.post('/mcp/add', data);
};

/**
 * 更新 MCP 服务器
 */
export const updateMCPServer = async (data: UpdateMCPServerRequest): Promise<MCPServer> => {
  return await request.put('/mcp/server', data);
};

/**
 * 删除 MCP 服务器
 * 使用 bizName 作为路径参数：DELETE /mcp/remove/{bizName}
 */
export const deleteMCPServer = async (bizName: string): Promise<void> => {
  await request.delete(`/mcp/remove/${bizName}`);
};

/**
 * 测试 MCP 服务器连接
 */
export const testMCPServerConnection = async (endpoint: string): Promise<{ success: boolean; message: string }> => {
  return await request.post('/mcp/test', { endpoint });
};

/**
 * 刷新 MCP 服务器状态
 * 使用 bizName 作为路径参数：POST /mcp/refresh/{bizName}
 */
export const refreshMCPServerState = async (bizName: string): Promise<MCPServer> => {
  return await request.post(`/mcp/refresh/${bizName}`);
};
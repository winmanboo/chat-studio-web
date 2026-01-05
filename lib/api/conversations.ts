import request from './request';

// 创建会话接口返回的sessionId类型
export type SessionId = string;

// 会话列表项类型
export interface SessionItem {
  sessionId: string;
  sessionTitle: string;
  updatedAt: number;
}

// 检索结果类型定义
interface RetrieveResult {
  kbId?: number;
  docId?: string;
  title: string;
  chunkIndexs?: string[];
  url?: string; // Web搜索时的URL
}

// 会话消息类型
export interface SessionMessage {
  id: number;
  sessionId: string;
  message: string;
  thinking?: string; // 深度思考内容，仅在ASSISTANT消息中存在
  messageType: 'USER' | 'ASSISTANT';
  parentId: number;
  modelName?: string; // 模型名称  
  kbName?: string; // 知识库名称，仅在ASSISTANT消息中存在
  retrieves?: RetrieveResult[]; // 检索结果，仅在ASSISTANT消息中存在
  toolNames?: string[]; // 调用的工具名称列表，仅在ASSISTANT消息中存在
}

// 创建会话接口
export const createSession = (): Promise<SessionId> => {
  return request.post<SessionId>('/session/create') as unknown as Promise<SessionId>;
};

// 获取会话列表接口
export const getSessionList = (): Promise<SessionItem[]> => {
  return request.get<SessionItem[]>('/session/list') as unknown as Promise<SessionItem[]>;
};

// 获取会话消息接口
export const getSessionMessages = (sessionId: string): Promise<SessionMessage[]> => {
  return request.get<SessionMessage[]>(`/session/messages/${sessionId}`) as unknown as Promise<SessionMessage[]>;
};

// 删除会话接口 - 支持单个或批量删除
export const deleteSession = (sessionId: string | string[]): Promise<void> => {
  const sessionIds = Array.isArray(sessionId) ? sessionId : [sessionId];
  return request.delete<void>(`/session/delete`, { data: sessionIds }) as unknown as Promise<void>;
};

// 修改会话标题接口
export const updateSessionTitle = (sessionId: string, title: string): Promise<void> => {
  return request.put<void>(`/session/modify/title/${sessionId}/${encodeURIComponent(title)}`) as unknown as Promise<void>;
};

// 聊天接口参数类型
export interface ChatRequest {
  sessionId: string;
  prompt: string;
  providerId?: string; // 模型提供商ID
  modelName?: string; // 模型名称
  search?: boolean;
  retrieval?: boolean;
  thinking?: boolean;
  kbId?: number; // 知识库ID，当retrieval为true时使用
  uploadId?: string; // 上传文件ID
  contentType?: string; // 上传文件类型
}

// 聊天接口返回类型 - 流式响应，这里只做类型声明
export type ChatResponse = string;

// 流式聊天接口
export const chatStream = async (data: ChatRequest, signal?: AbortSignal): Promise<ReadableStreamDefaultReader<Uint8Array>> => {
  // 使用fetch API处理流式响应，因为axios在浏览器中不支持stream
  const baseUrl = '/api';
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : '';
  
  const response = await fetch(`${baseUrl}/chat/v1/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept-Encoding': 'gzip',
      ...(token ? { 'Auth-Token': token } : {}),
    },
    body: JSON.stringify(data),
    signal, // 添加 AbortSignal 支持
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  if (!response.body) {
    throw new Error('Response body is null');
  }

  return response.body.getReader();
};
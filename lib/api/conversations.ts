import request from './request';

// 创建会话接口返回的sessionId类型
export type SessionId = string;

// 会话列表项类型
export interface SessionItem {
  sessionId: string;
  sessionTitle: string;
  createdAt: number;
}

// 检索结果类型定义
interface RetrieveResult {
  kbId: number;
  docId: string;
  title: string;
  chunkIndexs: string[];
}

// 会话消息类型
export interface SessionMessage {
  id: number;
  sessionId: string;
  message: string;
  messageType: 'USER' | 'ASSISTANT';
  parentId: number;
  kbName?: string; // 知识库名称，仅在ASSISTANT消息中存在
  retrieves?: RetrieveResult[]; // 检索结果，仅在ASSISTANT消息中存在
}

// 创建会话接口
export const createSession = (): Promise<SessionId> => {
  return request.post<SessionId>('/chat/v1/session/create') as unknown as Promise<SessionId>;
};

// 获取会话列表接口
export const getSessionList = (): Promise<SessionItem[]> => {
  return request.get<SessionItem[]>('/chat/v1/sessions') as unknown as Promise<SessionItem[]>;
};

// 获取会话消息接口
export const getSessionMessages = (sessionId: string): Promise<SessionMessage[]> => {
  return request.get<SessionMessage[]>(`/chat/v1/messages/${sessionId}`) as unknown as Promise<SessionMessage[]>;
};

// 删除会话接口
export const deleteSession = (sessionIds: string[]): Promise<void> => {
  return request.delete<void>('/chat/v1/session/delete', {
    data: sessionIds // 直接发送数组，匹配后端 List<String> 参数
  }) as unknown as Promise<void>;
};

// 聊天接口参数类型
export interface ChatRequest {
  sessionId: string;
  prompt: string;
  searchEnabled?: boolean;
  thinkingEnabled?: boolean;
  ragEnabled?: boolean;
  kbId?: number; // 知识库ID，当ragEnabled为true时使用
}

// 聊天接口返回类型 - 流式响应，这里只做类型声明
export type ChatResponse = string;

// 流式聊天接口
export const chatStream = async (data: ChatRequest): Promise<ReadableStreamDefaultReader<Uint8Array>> => {
  // 使用fetch API处理流式响应，因为axios在浏览器中不支持stream
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : '';
  
  const response = await fetch(`${baseUrl}/chat/v1/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Auth-Token': token } : {}),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  if (!response.body) {
    throw new Error('Response body is null');
  }

  return response.body.getReader();
};
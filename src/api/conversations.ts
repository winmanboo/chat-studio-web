import request from './request';
import { AxiosResponseTransformer } from 'axios';

// 创建会话接口返回的sessionId类型
export type SessionId = string;

// 创建会话接口
export const createSession = (): Promise<SessionId> => {
  return request.post<SessionId>('/chat/v1/session/create') as unknown as Promise<SessionId>;
};

// 聊天接口参数类型
export interface ChatRequest {
  sessionId: string;
  prompt: string;
  searchEnabled?: boolean;
  thinkingEnabled?: boolean;
  ragEnabled?: boolean;
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
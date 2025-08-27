import request from './request';

// 知识库数据类型定义
export interface KnowledgeBase {
  id: number;
  name: string;
  description: string;
  createdTime: string;
  updatedTime: string;
  docCount: number;
  tags: string[];
}

// 分页响应类型
export interface PageResponse<T> {
  records: T[];
  current: number;
  size: number;
  total: number;
}

// API响应类型
export interface ApiResponse<T> {
  code: string;
  msg: string;
  success: boolean;
  data: T;
}

// 分页参数
export interface PageParams {
  pageNum: number;
  pageSize: number;
  keyword?: string;
}

// 获取知识库分页数据
export const getKnowledgeBasePage = async (params: PageParams): Promise<PageResponse<KnowledgeBase>> => {
  return await request.get('/kb/page', {
    params: {
      pageNum: params.pageNum,
      pageSize: params.pageSize,
      ...(params.keyword && { keyword: params.keyword })
    }
  });
};

// 删除知识库
export const deleteKnowledgeBase = async (id: number): Promise<void> => {
  await request.delete(`/kb/${id}`);
};

// 创建知识库
export const createKnowledgeBase = async (data: Omit<KnowledgeBase, 'id' | 'createdTime' | 'updatedTime' | 'docCount'>): Promise<KnowledgeBase> => {
  return await request.post('/kb', data);
};

// 更新知识库
export const updateKnowledgeBase = async (id: number, data: Partial<Omit<KnowledgeBase, 'id' | 'createdTime' | 'updatedTime' | 'docCount'>>): Promise<KnowledgeBase> => {
  return await request.put(`/kb/${id}`, data);
};
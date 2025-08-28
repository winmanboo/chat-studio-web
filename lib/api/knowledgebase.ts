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

// 字典项接口
export interface DictItem {
  code: string;
  name: string;
}

// 新增知识库参数
export interface TagItem {
  id: number;
  name: string;
}

export interface CreateKnowledgeBaseParams {
  name: string;
  description?: string;
  retrievalMode: string;
  splitStrategy: string;
  topK: number;
  rerankEnabled: boolean;
  tags?: Array<{ id?: number; name: string }>;
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

// 获取字典数据
export const getDictItems = (type: string): Promise<DictItem[]> => {
  return request.get(`/dict/items/${type}`);
};

export const getKnowledgeBaseTags = (): Promise<TagItem[]> => {
  return request.get('/tags/kb');
};

// 创建知识库
export const createKnowledgeBase = async (data: CreateKnowledgeBaseParams): Promise<KnowledgeBase> => {
  return await request.post('/kb/add', data);
};

// 更新知识库
export const updateKnowledgeBase = async (id: number, data: Partial<Omit<KnowledgeBase, 'id' | 'createdTime' | 'updatedTime' | 'docCount'>>): Promise<KnowledgeBase> => {
  return await request.put(`/kb/${id}`, data);
};
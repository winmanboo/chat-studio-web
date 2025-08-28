import request from './request';

// 文档数据类型定义
export interface Document {
  id: number;
  title: string;
  sourceType: string;
  enabled: boolean;
  tags: string[];
  status: 'QUEUE' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  error: string | null;
  chunkSize: number;
  size: number;
  uploadTime: string;
}

// 分页响应类型
export interface DocumentPageResponse {
  records: Document[];
  current: number;
  size: number;
  total: number;
}

// 分页参数
export interface DocumentPageParams {
  kbId: string;
  pageNum: number;
  pageSize: number;
  keyword?: string;
}

// 获取文档分页列表
export const getDocumentPage = async (params: DocumentPageParams): Promise<DocumentPageResponse> => {
  return await request.get('/doc/page', {
    params: {
      kbId: params.kbId,
      pageNum: params.pageNum,
      pageSize: params.pageSize,
      keyword: params.keyword || undefined
    }
  });
};

// 删除文档
export const deleteDocument = async (docId: number): Promise<void> => {
  await request.delete(`/doc/${docId}`);
};

// 更新文档
export const updateDocument = async (docId: number, params: Partial<Document>): Promise<void> => {
  await request.put(`/doc/${docId}`, params);
};

// 上传文档
export const uploadDocument = async (kbId: string, file: File): Promise<void> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('kbId', kbId);
  
  await request.post('/doc/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};
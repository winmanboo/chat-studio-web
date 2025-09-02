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

// 文档上传参数
export interface DocumentUploadParams {
  title: string;
  storageType: string;
  sourceType: string;
  description?: string;
  uploadFileUrl?: string;
}

// 上传文档（原有接口，保持兼容）
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

// 上传文档（完整表单）
export const uploadDocumentWithForm = async (
  kbId: string, 
  params: DocumentUploadParams, 
  file?: File
): Promise<void> => {
  const formData = new FormData();
  
  // 构建document部分的JSON数据
  const documentData: {
    kbId: string;
    title: string;
    storageType: string;
    sourceType: string;
    description?: string;
    uploadFileUrl?: string;
  } = {
    kbId: kbId,
    title: params.title,
    storageType: params.storageType,
    sourceType: params.sourceType
  };
  
  // 只有当description有值时才添加
  if (params.description?.trim()) {
    documentData.description = params.description;
  }
  
  // 只有当uploadFileUrl有值时才添加
  if (params.uploadFileUrl?.trim()) {
    documentData.uploadFileUrl = params.uploadFileUrl;
  }
  
  // 将document作为JSON字符串添加到FormData
  const documentBlob = new Blob([JSON.stringify(documentData)], {
    type: 'application/json'
  });
  formData.append('document', documentBlob);
  
  // 根据sourceType添加相应的文件或URL参数
  if (params.sourceType === 'UPLOAD' && file) {
    formData.append('file', file);
  } else if (params.sourceType === 'WEB' && params.uploadFileUrl) {
    // WEB类型时，文件信息已包含在document中的uploadFileUrl字段
    // 创建一个空的文件占位符以满足后端@RequestPart("file")的要求
    const emptyFile = new Blob([''], { type: 'text/plain' });
    formData.append('file', emptyFile, 'placeholder.txt');
  }
  
  await request.post('/doc/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};
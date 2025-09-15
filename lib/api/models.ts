import request from './request';

// 模型提供商数据类型定义
export interface ModelProvider {
  id: string;
  providerName: string;
  sourceType: string;
  baseUrl: string;
  icon: string;
  desc: string;
}

// 已安装模型数据类型定义
export interface InstalledModel {
  id: number;
  modelInstalledName: string;
  sourceType: 'service' | 'local';
  enabled: boolean;
}

// API响应类型定义
export interface ModelProvidersResponse {
  code: string;
  msg: string;
  success: boolean;
  data: ModelProvider[];
}

// 已安装模型API响应类型定义
export interface InstalledModelsResponse {
  code: string;
  msg: string;
  success: boolean;
  data: InstalledModel[];
}

// 获取模型提供商列表
export const getModelProviders = async (): Promise<ModelProvider[]> => {
  try {
    const data = await request.get('/models/modelProviders');
    return data as unknown as ModelProvider[];
  } catch (error) {
    console.error('获取模型提供商列表失败:', error);
    throw error;
  }
};

// 获取已安装模型列表
export const getInstalledModels = async (): Promise<InstalledModel[]> => {
  try {
    const data = await request.get('/models/installed/list');
    return data as unknown as InstalledModel[];
  } catch (error) {
    console.error('获取已安装模型列表失败:', error);
    throw error;
  }
};

// 安装模型接口
export const installModel = async (providerId: string, apiKey: string): Promise<{ success: boolean; message?: string }> => {
  const response = await request.post(`/models/install/${providerId}/${apiKey}`);
  // 由于响应拦截器会返回data字段，成功时data为null，所以直接返回成功状态
  return { success: true, message: '安装成功' };
};
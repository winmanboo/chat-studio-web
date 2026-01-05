import request from './request';

// 字典项接口
export interface DictItem {
  code: string;
  name: string;
}

// 获取字典数据
export const getDictItems = (type: string): Promise<DictItem[]> => {
  return request.get(`/dict/items/${type}`);
};

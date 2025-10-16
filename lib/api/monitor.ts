import request from './request';

// 监控数据接口返回的数据结构
export interface MonitorDataResponse {
  results: {
    A?: MonitorResult; // Token使用总量
    B?: MonitorResult; // Token输入总量
    C?: MonitorResult; // Token输出总量
    D?: MonitorResult; // 用户活跃数
    E?: MonitorResult; // 用户Token消耗排行
    F?: MonitorResult; // Token使用分布
  };
}

export interface MonitorResult {
  status: number;
  frames: MonitorFrame[];
}

export interface MonitorFrame {
  schema: {
    refId: string;
    meta: {
      type: string;
      typeVersion: number[];
      custom: {
        calculatedMinStep: number;
        resultType: string;
      };
      executedQueryString: string;
    };
    fields: MonitorField[];
  };
  data: {
    values: any[][];
  };
}

export interface MonitorField {
  name: string;
  type: string;
  typeInfo: {
    frame: string;
  };
  config?: {
    interval?: number;
    displayNameFromDS?: string;
  };
  labels?: {
    [key: string]: string;
  };
}

/**
 * 监控数据查询参数
 */
export interface MonitorQueryParams {
  from: number; // 开始时间戳（毫秒）
  to: number;   // 结束时间戳（毫秒）
}

/**
 * 获取监控数据
 */
export const getMonitorData = async (params: MonitorQueryParams): Promise<MonitorDataResponse> => {
  try {
    const response = await request.get('/monitor/data', {
      params: {
        from: params.from,
        to: params.to
      }
    });
    
    // 如果 response.data 是 undefined，说明响应拦截器已经将数据提取到了响应对象本身
    // 直接返回响应对象
    if (response.data === undefined && (response as any).results) {
      return (response as any) as MonitorDataResponse;
    }
    
    return response.data;
  } catch (error) {
    throw error;
  }
};
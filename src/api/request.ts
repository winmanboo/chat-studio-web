import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';

// 创建axios实例
const request = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 在发送请求之前做些什么
    // 从localStorage获取Auth-Token并添加到请求头
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers['Auth-Token'] = token;
      }
    }
    
    return config;
  },
  (error: AxiosError) => {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse) => {
    // 对响应数据做点什么
    // 处理通用响应格式
    const { code, msg, success, data } = response.data;
    
    // 检查响应是否成功
    if (success === false || (code && code !== 'SUCCESS')) {
      // 可以根据业务需要处理错误情况
      return Promise.reject(new Error(msg || '请求失败'));
    }
    
    // 返回data字段
    return data;
  },
  (error: AxiosError) => {
    // 对响应错误做点什么
    if (error.response?.status === 401) {
      // 处理未授权错误
      // 例如：清除token并重定向到登录页面
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
      }
    }
    
    return Promise.reject(error);
  }
);

export default request;
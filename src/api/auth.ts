import request from './request';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  pwd: string;
  captcha: string;
  inviteCode?: string;
}

export interface UserInfo {
  userId: string;
  email: string;
  nickName: string;
  state: string;
  inviteCode: string;
  capacity: number;
  profileAvatarUrl: string;
  userRole: 'ADMIN' | 'ORDINARY';
}

export interface AuthResponse {
  userInfo: UserInfo;
  tokenValue: string;
  tokenExpireTime: number;
}

// 登录
export const login = (data: LoginRequest) => {
  return request.post<AuthResponse>('/auth/login', data);
};

// 注册
export const register = (data: RegisterRequest) => {
  return request.post('/auth/register', data);
};

// 发送验证码
export const sendCode = (email: string) => {
  return request.get('/auth/sendCode', {
    params: { email }
  });
};

// 登出
export const logout = () => {
  return request.post('/auth/logout');
};
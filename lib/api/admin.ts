import request from './request';

// 用户状态枚举
export enum UserState {
  INIT = 'INIT',
  ACTIVE = 'ACTIVE',
  FROZEN = 'FROZEN'
}

// 用户角色枚举
export enum UserRole {
  ADMIN = 'ADMIN',
  ORDINARY = 'ORDINARY'
}

// 用户数据接口
export interface UserData {
  userId: string;
  email: string;
  nickName: string;
  state: UserState;
  inviteCode: string;
  capacity: number;
  profileAvatarUrl: string | null;
  userRole: UserRole;
  createdTime: string;
}

// 分页查询参数
export interface UserListParams {
  pageNum: number;
  pageSize: number;
}

// 分页响应数据 - 使用不同的名称避免冲突
export interface UserPageResponse<T> {
  records: T[];
  current: number;
  size: number;
  total: number;
}

// API响应结构 - 使用不同的名称避免冲突
export interface AdminApiResponse<T> {
  code: string;
  msg: string;
  success: boolean;
  data: T;
}

/**
 * 获取用户分页列表
 * @param params 分页参数
 * @returns 用户列表数据
 */
export const getUserList = async (params: UserListParams): Promise<UserPageResponse<UserData>> => {
  const response = await request.get('/admin/userList', {
    params
  });
  return response as unknown as UserPageResponse<UserData>;
};

/**
 * 删除用户
 * @param userId 用户ID
 * @returns 删除结果
 */
export const deleteUser = async (userId: string): Promise<any> => {
  const response = await request.delete(`/admin/user/${userId}`);
  return response;
};

/**
 * 激活用户
 * @param userId 用户ID
 * @returns 激活结果
 */
export const activateUser = async (userId: string): Promise<any> => {
  const response = await request.post(`/admin/active/${userId}`);
  return response;
};

/**
 * 更新用户信息
 * @param userId 用户ID
 * @param userData 用户数据
 * @returns 更新结果
 */
export const updateUser = async (userId: string, userData: Partial<UserData>): Promise<any> => {
  const response = await request.put(`/admin/user/${userId}`, userData);
  return response;
};
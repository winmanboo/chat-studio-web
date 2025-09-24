'use client';

import React, { useState, useEffect } from 'react';
import { Card, Typography, Table, Tag, Avatar, Space, Button, message, Modal, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { getUserList, deleteUser, activateUser, UserData, UserState, UserRole, UserListParams } from '@/lib/api';

const { Title } = Typography;

interface UserManagementPanelProps {
  // 可以根据需要添加props来传递数据
}

const UserManagementPanel: React.FC<UserManagementPanelProps> = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 获取用户列表
  const fetchUsers = async (pageNum: number = 1, pageSize: number = 10) => {
    setLoading(true);
    try {
      const params: UserListParams = { pageNum, pageSize };
      const response = await getUserList(params);
      
      // 响应拦截器已经提取了data字段，所以response就是分页数据
      setUsers(response.records);
      setPagination({
        current: response.current,
        pageSize: response.size,
        total: response.total,
      });
    } catch (error) {
      message.error('获取用户列表失败');
      console.error('获取用户列表错误:', error);
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载时获取数据
  useEffect(() => {
    fetchUsers();
  }, []);

  // 处理分页变化
  const handleTableChange = (page: number, pageSize?: number) => {
    fetchUsers(page, pageSize || 10);
  };

  // 删除用户
  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await deleteUser(userId);
      if (response.success) {
        message.success('删除用户成功');
        fetchUsers(pagination.current, pagination.pageSize);
      } else {
        message.error(response.msg || '删除用户失败');
      }
    } catch (error) {
      message.error('删除用户失败');
      console.error('删除用户错误:', error);
    }
  };

  // 激活用户
  const handleActivateUser = async (userId: string) => {
    try {
      await activateUser(userId);
      message.success('用户激活成功');
      // 刷新列表
      fetchUsers(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error('用户激活失败');
      console.error('激活用户错误:', error);
    }
  };

  // 修改用户（暂时只是提示，具体实现可以后续添加）
  const handleEditUser = (user: UserData) => {
    message.info('编辑用户功能待实现');
    // TODO: 实现编辑用户功能
  };

  const userColumns = [
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'userId',
    },
    {
      title: '昵称',
      dataIndex: 'nickName',
      key: 'nickName',
      render: (text: string, record: UserData) => (
        <Space>
          <Avatar size="small" src={record.profileAvatarUrl}>
            {text.charAt(0)}
          </Avatar>
          {text}
        </Space>
      ),
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '角色',
      dataIndex: 'userRole',
      key: 'userRole',
      render: (role: UserRole) => (
        <Tag color={role === UserRole.ADMIN ? 'red' : 'blue'}>
          {role === UserRole.ADMIN ? '管理员' : '普通用户'}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'state',
      key: 'state',
      render: (state: UserState) => {
        const stateConfig = {
          [UserState.ACTIVE]: { color: 'green', text: '已激活' },
          [UserState.INIT]: { color: 'orange', text: '待激活' },
          [UserState.FROZEN]: { color: 'red', text: '已冻结' },
        };
        const config = stateConfig[state] || { color: 'default', text: state };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '容量',
      dataIndex: 'capacity',
      key: 'capacity',
      render: (capacity: number) => capacity === -1 ? '无限制' : `${capacity} MB`,
    },
    {
      title: '注册时间',
      dataIndex: 'createdTime',
      key: 'createdTime',
      render: (time: string) => new Date(time).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: UserData) => {
        const isAdmin = record.userRole === UserRole.ADMIN;
        const needsActivation = record.state === UserState.INIT || record.state === UserState.FROZEN;
        
        return (
          <Space size="middle">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEditUser(record)}
              disabled={isAdmin}
              style={{ color: isAdmin ? '#ccc' : undefined }}
            >
              修改
            </Button>
            
            <Popconfirm
              title="确定要删除这个用户吗？"
              onConfirm={() => handleDeleteUser(record.userId)}
              okText="确定"
              cancelText="取消"
              disabled={isAdmin}
            >
              <Button
                type="link"
                danger
                icon={<DeleteOutlined />}
                disabled={isAdmin}
                style={{ color: isAdmin ? '#ccc' : undefined }}
              >
                删除
              </Button>
            </Popconfirm>
            
            {needsActivation && (
              <Button
                type="link"
                icon={<CheckCircleOutlined />}
                onClick={() => handleActivateUser(record.userId)}
                disabled={isAdmin}
                style={{ color: isAdmin ? '#ccc' : '#52c41a' }}
              >
                激活
              </Button>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      <Title level={3}>用户管理</Title>
      <Card>
        <Table 
          columns={userColumns} 
          dataSource={users}
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
            onChange: handleTableChange,
            onShowSizeChange: handleTableChange,
          }}
          rowKey="userId"
        />
      </Card>
    </div>
  );
};

export default UserManagementPanel;
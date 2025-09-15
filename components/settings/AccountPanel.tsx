import React from 'react';
import { Typography, Avatar, Card, Divider, Space, Button } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { UserInfo } from '../../lib/api';

const { Title, Text } = Typography;

interface AccountPanelProps {
  userInfo: UserInfo | null;
}

const AccountPanel: React.FC<AccountPanelProps> = ({ userInfo }) => {
  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>账号信息</Title>
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <Avatar size={64} icon={<UserOutlined />} style={{ marginRight: 16 }} />
          <div>
            <Title level={5} style={{ margin: 0, marginBottom: 4 }}>
              {userInfo?.nickName || 'Chat Studio User'}
            </Title>
            <Text type="secondary">{userInfo?.email || 'user@chatstudio.com'}</Text>
          </div>
        </div>
        <Divider style={{ margin: '16px 0' }} />
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text strong>用户角色:</Text>
            <Text>{userInfo?.userRole === 'ADMIN' ? '管理员' : '普通用户'}</Text>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text strong>注册时间:</Text>
            <Text>2024-01-01</Text>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text strong>最后登录:</Text>
            <Text>刚刚</Text>
          </div>
        </Space>
      </Card>
      <Space>
        <Button type="primary">修改密码</Button>
        <Button>编辑资料</Button>
      </Space>
    </div>
  );
};

export default AccountPanel;
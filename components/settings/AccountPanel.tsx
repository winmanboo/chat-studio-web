import React from 'react';
import { Typography, Avatar, Card, Divider, Space, Button, theme } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { UserInfo } from '../../lib/api';
import styles from './SettingsCommon.module.css';

const { Title, Text } = Typography;

interface AccountPanelProps {
  userInfo: UserInfo | null;
}

const AccountPanel: React.FC<AccountPanelProps> = ({ userInfo }) => {
  const { token } = theme.useToken();
  // 格式化容量显示
  const formatCapacity = (capacity?: number) => {
    if (!capacity) return '0 MB';
    if (capacity === -1) {
      return '无限制';
    }
    if (capacity >= 1024) {
      return `${(capacity / 1024).toFixed(2)} GB`;
    }
    return `${capacity} MB`;
  };

  // 格式化状态显示
  const formatState = (state?: string) => {
    switch (state) {
      case 'INIT':
        return { text: '初始（未激活）', color: token.colorWarning };
      case 'ACTIVE':
        return { text: '已激活', color: token.colorSuccess };
      case 'FROZEN':
        return { text: '冻结', color: token.colorError };
      default:
        return { text: state || '未知', color: token.colorTextSecondary };
    }
  };

  return (
    <div>
      <Title level={4} className={styles.panelTitle}>账号信息</Title>
      <Card className={styles.card}>
        <div className={styles.avatarContainer}>
          <Avatar 
            size={64} 
            src={userInfo?.profileAvatarUrl} 
            icon={<UserOutlined />} 
            className={styles.avatar}
          />
          <div>
            <Title level={5} className={styles.titleReset}>
              {userInfo?.nickName || 'Chat Studio User'}
            </Title>
            <Text type="secondary">{userInfo?.email || 'user@chatstudio.com'}</Text>
          </div>
        </div>
        <Divider className={styles.divider} />
        <Space direction="vertical" className={styles.section}>
          <div className={styles.spaceBetween}>
            <Text strong>用户ID:</Text>
            <Text>{userInfo?.userId || '未知'}</Text>
          </div>
          <div className={styles.spaceBetween}>
            <Text strong>用户角色:</Text>
            <Text>{userInfo?.userRole === 'ADMIN' ? '管理员' : '普通用户'}</Text>
          </div>
          <div className={styles.spaceBetween}>
            <Text strong>账号状态:</Text>
            <Text style={{ color: formatState(userInfo?.state).color }}>
              {formatState(userInfo?.state).text}
            </Text>
          </div>
          <div className={styles.spaceBetween}>
            <Text strong>存储容量:</Text>
            <Text>{formatCapacity(userInfo?.capacity)}</Text>
          </div>
          {userInfo?.inviteCode && (
            <div className={styles.spaceBetween}>
              <Text strong>邀请码:</Text>
              <Text>{userInfo.inviteCode}</Text>
            </div>
          )}
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

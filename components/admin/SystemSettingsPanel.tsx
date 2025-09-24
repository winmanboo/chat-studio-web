'use client';

import React from 'react';
import { Card, Typography, Space } from 'antd';

const { Title, Text } = Typography;

interface SystemSettingsPanelProps {
  // 可以根据需要添加props来传递数据
}

const SystemSettingsPanel: React.FC<SystemSettingsPanelProps> = () => {
  return (
    <div>
      <Title level={3}>系统设置</Title>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card title="基础配置">
          <Text type="secondary">系统基础参数配置</Text>
        </Card>
        <Card title="邮件设置">
          <Text type="secondary">SMTP服务器配置</Text>
        </Card>
        <Card title="存储配置">
          <Text type="secondary">文件存储和数据库配置</Text>
        </Card>
      </Space>
    </div>
  );
};

export default SystemSettingsPanel;
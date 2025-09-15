import React from 'react';
import { Typography, Card, Space, Divider } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const AboutPanel: React.FC = () => {
  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>关于</Title>
      <Card>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <InfoCircleOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
          <Title level={3} style={{ margin: 0 }}>Chat Studio</Title>
          <Text type="secondary">智能对话助手</Text>
        </div>
        <Divider />
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text strong>版本:</Text>
            <Text>v1.0.0</Text>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text strong>构建时间:</Text>
            <Text>2024-01-15</Text>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text strong>技术栈:</Text>
            <Text>Next.js + React + TypeScript</Text>
          </div>
        </Space>
        <Divider />
        <Paragraph style={{ marginBottom: 0 }}>
          <Text type="secondary">
            Chat Studio 是一个现代化的智能对话平台，提供流畅的聊天体验和丰富的功能设置。
            我们致力于为用户提供最佳的AI对话体验。
          </Text>
        </Paragraph>
      </Card>
    </div>
  );
};

export default AboutPanel;
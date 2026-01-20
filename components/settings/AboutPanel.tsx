import React from 'react';
import { Typography, Card, Space, Divider, theme } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import styles from './SettingsCommon.module.css';

const { Title, Text, Paragraph } = Typography;

const AboutPanel: React.FC = () => {
  const { token } = theme.useToken();

  return (
    <div>
      <Title level={4} className={styles.panelTitle}>关于</Title>
      <Card>
        <div className={styles.centerContainer}>
          <InfoCircleOutlined className={styles.largeIcon} />
          <Title level={3} className={styles.titleReset}>Chat Studio</Title>
          <Text type="secondary">智能对话助手</Text>
        </div>
        <Divider />
        <Space direction="vertical" className={styles.section} size="middle">
          <div className={styles.spaceBetween}>
            <Text strong>版本:</Text>
            <Text>v1.0.0</Text>
          </div>
          <div className={styles.spaceBetween}>
            <Text strong>构建时间:</Text>
            <Text>2024-01-15</Text>
          </div>
          <div className={styles.spaceBetween}>
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

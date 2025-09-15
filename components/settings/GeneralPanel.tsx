import React from 'react';
import { Space, Switch, Typography } from 'antd';
import { BellOutlined, SaveOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const GeneralPanel: React.FC = () => {
  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>通用设置</Title>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 500, marginBottom: 4 }}>
              <BellOutlined style={{ marginRight: 8 }} />
              桌面通知
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>接收新消息时显示桌面通知</Text>
          </div>
          <Switch defaultChecked />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 500, marginBottom: 4 }}>
              <SaveOutlined style={{ marginRight: 8 }} />
              自动保存对话
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>自动保存对话历史记录</Text>
          </div>
          <Switch defaultChecked />
        </div>
      </Space>
    </div>
  );
};

export default GeneralPanel;
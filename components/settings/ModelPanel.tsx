import React from 'react';
import { Space, Typography, Select, Input } from 'antd';

const { Title, Text } = Typography;
const { Option } = Select;

const ModelPanel: React.FC = () => {
  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>模型设置</Title>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div>
          <div style={{ fontWeight: 500, marginBottom: 8 }}>默认模型</div>
          <Select defaultValue="gpt-3.5-turbo" style={{ width: '100%' }}>
            <Option value="gpt-3.5-turbo">GPT-3.5 Turbo</Option>
            <Option value="gpt-4">GPT-4</Option>
            <Option value="claude-3">Claude-3</Option>
          </Select>
        </div>
        <div>
          <div style={{ fontWeight: 500, marginBottom: 8 }}>温度设置</div>
          <Input placeholder="0.7" style={{ width: '100%' }} />
          <Text type="secondary" style={{ fontSize: 12, marginTop: 4, display: 'block' }}>
            控制回答的随机性，范围 0-2，数值越高越随机
          </Text>
        </div>
        <div>
          <div style={{ fontWeight: 500, marginBottom: 8 }}>最大令牌数</div>
          <Input placeholder="2048" style={{ width: '100%' }} />
          <Text type="secondary" style={{ fontSize: 12, marginTop: 4, display: 'block' }}>
            单次对话的最大令牌数限制
          </Text>
        </div>
      </Space>
    </div>
  );
};

export default ModelPanel;
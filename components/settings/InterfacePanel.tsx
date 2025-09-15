import React from 'react';
import { Space, Switch, Typography, Select } from 'antd';
import { MoonOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

const InterfacePanel: React.FC = () => {
  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>界面设置</Title>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div>
          <div style={{ fontWeight: 500, marginBottom: 8 }}>主题</div>
          <Select defaultValue="system" style={{ width: '100%' }}>
            <Option value="light">浅色</Option>
            <Option value="dark">深色</Option>
            <Option value="system">跟随系统</Option>
          </Select>
        </div>
        <div>
          <div style={{ fontWeight: 500, marginBottom: 8 }}>语言</div>
          <Select defaultValue="zh-CN" style={{ width: '100%' }}>
            <Option value="zh-CN">简体中文</Option>
            <Option value="en-US">English</Option>
          </Select>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 500, marginBottom: 4 }}>
              <MoonOutlined style={{ marginRight: 8 }} />
              深色模式
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>启用深色主题界面</Text>
          </div>
          <Switch />
        </div>
      </Space>
    </div>
  );
};

export default InterfacePanel;
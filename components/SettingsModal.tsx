import React, { useState, useEffect } from 'react';
import { Modal, Switch, Divider, Space, Menu, Typography, Avatar, Card, Select, Button, Input } from 'antd';
import { 
  SettingOutlined, 
  AppstoreOutlined, 
  SkinOutlined, 
  RobotOutlined, 
  UserOutlined, 
  InfoCircleOutlined,
  BellOutlined,
  SaveOutlined,
  MoonOutlined
} from '@ant-design/icons';
import { UserInfo } from '../lib/api';

const { Title, Text } = Typography;
const { Option } = Select;

interface SettingsModalProps {
  open: boolean;
  onCancel: () => void;
}

type SettingTab = 'general' | 'interface' | 'model' | 'account' | 'about';

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  open, 
  onCancel
}) => {
  const [activeTab, setActiveTab] = useState<SettingTab>('general');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  // 从localStorage获取用户信息
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUserInfo = localStorage.getItem('userInfo');
      if (storedUserInfo) {
        try {
          setUserInfo(JSON.parse(storedUserInfo));
        } catch {
          console.error('解析用户信息失败');
        }
      }
    }
  }, [open]);

  // 左侧菜单项
  const menuItems = [
    {
      key: 'general',
      icon: <AppstoreOutlined />,
      label: '通用',
    },
    {
      key: 'interface',
      icon: <SkinOutlined />,
      label: '界面',
    },
    {
      key: 'model',
      icon: <RobotOutlined />,
      label: '模型',
    },
    {
      key: 'account',
      icon: <UserOutlined />,
      label: '账号',
    },
    {
      key: 'about',
      icon: <InfoCircleOutlined />,
      label: '关于',
    },
  ];

  // 渲染右侧内容
  const renderContent = () => {
    switch (activeTab) {
      case 'general':
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
      case 'interface':
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
      case 'model':
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
      case 'account':
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
      case 'about':
        return (
          <div>
            <Title level={4} style={{ marginBottom: 24 }}>关于</Title>
            <Card>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <Title level={3} style={{ margin: 0, marginBottom: 8 }}>Chat Studio</Title>
                <Text type="secondary">版本 1.0.0</Text>
              </div>
              <Divider />
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <div>
                  <Text strong>产品介绍</Text>
                  <div style={{ marginTop: 8 }}>
                    <Text>Chat Studio 是一个智能对话平台，支持多种AI模型，提供知识库检索、文档上传等功能。</Text>
                  </div>
                </div>
                <div>
                  <Text strong>技术支持</Text>
                  <div style={{ marginTop: 8 }}>
                    <Text>如有问题请联系技术支持团队</Text>
                  </div>
                </div>
                <div>
                  <Text strong>版权信息</Text>
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary">© 2024 Chat Studio. All rights reserved.</Text>
                  </div>
                </div>
              </Space>
            </Card>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      centered
      title={
        <Space>
          <SettingOutlined />
          设置
        </Space>
      }
      width={800}
      styles={{
        body: { padding: 0, height: 500 }
      }}
    >
      <div style={{ display: 'flex', height: '100%' }}>
        {/* 左侧导航 */}
        <div style={{ 
          width: 200, 
          borderRight: '1px solid #f0f0f0',
          backgroundColor: '#fafafa'
        }}>
          <Menu
            mode="vertical"
            selectedKeys={[activeTab]}
            items={menuItems}
            onClick={({ key }) => setActiveTab(key as SettingTab)}
            style={{ 
              border: 'none',
              backgroundColor: 'transparent',
              height: '100%'
            }}
          />
        </div>
        
        {/* 右侧内容 */}
        <div style={{ 
          flex: 1, 
          padding: 24,
          overflowY: 'auto'
        }}>
          {renderContent()}
        </div>
      </div>
    </Modal>
  );
};

export default SettingsModal;
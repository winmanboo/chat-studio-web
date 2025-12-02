import React from 'react';
import { Layout, Avatar, Button, Dropdown, message, theme, Divider, Tag, Flex, Typography } from 'antd';
import type { MenuProps } from 'antd';
import { UserOutlined, SettingOutlined, LogoutOutlined, CrownOutlined, AppstoreOutlined, RocketOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Header } = Layout;
const { Text } = Typography;

interface UserInfo {
  userId: string;
  userRole: string;
  state: string;
  capacity: number;
  inviteCode: string;
}

interface HeaderProps {
  selectedTab: string;
  onUserClick: () => void;
  onSettingsClick: () => void;
  isLogin: boolean;
  onLogout: () => void;
  userInfo: UserInfo | null;
}

const HeaderComponent: React.FC<HeaderProps> = ({ selectedTab, onUserClick, onSettingsClick, isLogin, onLogout, userInfo }) => {
  const router = useRouter();
  const { token } = theme.useToken();

  const workbenchTabs = [
    { key: 'chat', icon: '💬', label: '聊天' },
    { key: 'kb', icon: '📚', label: '知识库' },
    { key: 'mcp', icon: '🔗', label: 'MCP' },
  ];

  const advancedTabs = [
    { key: 'agent', icon: '🤖', label: '智能体' },
    { key: 'workflow', icon: '⚡', label: '工作流' },
    { key: 'bi', icon: '📊', label: 'BI' },
    { key: 'news', icon: '📰', label: 'AI 情报' },
  ];

  const handleNewFeatureClick = (featureName: string) => {
    message.info(`${featureName}功能正在开发中`);
  };

  const handleAdminClick = () => {
    router.push('/admin');
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'settings',
      label: '设置',
      icon: <SettingOutlined />,
      onClick: onSettingsClick,
    },
    ...(userInfo?.userRole === 'ADMIN' ? [{
      key: 'admin',
      label: '管理员设置',
      icon: <CrownOutlined />,
      onClick: handleAdminClick,
    }] : []),
    {
      key: 'logout',
      label: '登出',
      icon: <LogoutOutlined />,
      onClick: onLogout,
    },
    {
      type: 'divider',
    },
    {
      key: 'online',
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, backgroundColor: '#52c41a', borderRadius: '50%' }}></div>
          当前在线用户: 1
        </div>
      ),
      disabled: true,
    },
  ];

  const renderTabButton = (tab: { key: string; icon: string; label: string }) => {
    const isSelected = selectedTab === tab.key;
    return (
      <div style={{ position: 'relative' }} key={tab.key}>
        <Button
          type="text"
          icon={<span style={{ fontSize: '16px' }}>{tab.icon}</span>}
          onClick={() => {
            if (tab.key === 'chat') router.push('/chat');
            else if (tab.key === 'kb') router.push('/knowledgebase');
            else if (tab.key === 'mcp') router.push('/mcp');
            else handleNewFeatureClick(tab.label);
          }}
          style={{
            height: 36,
            borderRadius: 8,
            padding: '0 16px',
            background: isSelected ? token.colorPrimary : 'transparent',
            color: isSelected ? '#fff' : token.colorTextSecondary,
            fontWeight: isSelected ? 600 : 400,
            border: 'none',
            transition: 'all 0.3s ease',
          }}
        >
          {tab.label}
        </Button>
        {isSelected && (
          <div
            style={{
              position: 'absolute',
              bottom: -4,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 20,
              height: 3,
              borderRadius: 2,
              background: token.colorPrimary,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          />
        )}
      </div>
    );
  };

  return (
    <Header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        height: 64,
        position: 'sticky',
        top: 0,
        zIndex: 1000,
      }}
    >
      <div className="logo" style={{ fontSize: 20, fontWeight: 'bold', color: token.colorPrimary, display: 'flex', alignItems: 'center', gap: 8 }}>
        Chat Studio
      </div>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          background: token.colorFillQuaternary, 
          padding: '4px 8px', 
          borderRadius: 12,
          gap: 12
        }}>
          {/* 工作台分组 */}
          <Flex align="center" gap={4}>
            <Text style={{ fontSize: 12, color: token.colorTextDescription, padding: '0 8px' }}>工作台</Text>
            {workbenchTabs.map(renderTabButton)}
          </Flex>

          <Divider type="vertical" style={{ height: 24, margin: 0, borderColor: token.colorBorderSecondary }} />

          {/* 高级功能分组 */}
          <Flex align="center" gap={4}>
            <Text style={{ fontSize: 12, color: token.colorTextDescription, padding: '0 8px' }}>高级功能</Text>
            {advancedTabs.map(renderTabButton)}
          </Flex>
        </div>
      </div>

      {/* 右上角用户按钮 */}
      <div>
        {isLogin ? (
          <Dropdown
            menu={{ items: menuItems, style: { width: 200 } }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Avatar
              size={40}
              icon={<UserOutlined />}
              style={{ 
                cursor: 'pointer', 
                background: token.colorPrimaryBg, 
                color: token.colorPrimary,
                border: `1px solid ${token.colorPrimaryBorder}`
              }}
            />
          </Dropdown>
        ) : (
          <Avatar
            size={40}
            icon={<UserOutlined />}
            style={{ 
              cursor: 'pointer', 
              background: token.colorFillSecondary, 
              color: token.colorTextSecondary 
            }}
            onClick={onUserClick}
          />
        )}
      </div>
    </Header>
  );
};

export default HeaderComponent;
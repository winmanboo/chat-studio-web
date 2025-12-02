import React from 'react';
import { Layout, Avatar, Button, Dropdown, message } from 'antd';
import type { MenuProps } from 'antd';
import { UserOutlined, SettingOutlined, LogoutOutlined, CrownOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Header } = Layout;

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
  const capsuleTabs = [
    { key: 'chat', icon: '💬', label: '聊天' },
    { key: 'kb', icon: '📚', label: '知识库' },
    { key: 'agent', icon: '🤖', label: '智能体' },
    { key: 'mcp', icon: '🔗', label: 'MCP' },
    { key: 'workflow', icon: '⚡', label: '工作流' },
    { key: 'bi', icon: '📊', label: 'BI' },
    { key: 'news', icon: '📰', label: 'AI 情报' },
  ];

  const handleNewFeatureClick = (featureName: string) => {
    message.info(`${featureName}功能正在开发中`);
  };

  const handleTabChange = (tab: string) => {
    const routeMap: Record<string, string> = {
      'chat': '/chat',
      'kb': '/knowledgebase',
      'mcp': '/mcp'
    };
    const route = routeMap[tab];
    if (route) {
      router.push(route);
    } else {
      handleNewFeatureClick(tab);
    }
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

  return (
    <Header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        background: '#fff',
        borderBottom: '1px solid #f0f0f0',
        height: 64,
        position: 'sticky',
        top: 0,
        zIndex: 1000,
      }}
    >
      <div className="logo" style={{ fontSize: 20, fontWeight: 'bold', color: '#1677ff' }}>
        Chat Studio
      </div>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: 8 }}>
        {capsuleTabs.map((tab) => {
          const isSelected = selectedTab === tab.key;
          return (
            <Button
              key={tab.key}
              type={isSelected ? 'primary' : 'text'}
              icon={<span>{tab.icon}</span>}
              onClick={() => {
                if (tab.key === 'chat') router.push('/chat');
                else if (tab.key === 'kb') router.push('/knowledgebase');
                else if (tab.key === 'mcp') router.push('/mcp');
                else handleNewFeatureClick(tab.label);
              }}
              style={{
                height: 40,
                borderRadius: 8,
                padding: '0 24px',
                background: isSelected ? '#e6f4ff' : 'transparent',
                color: isSelected ? '#1677ff' : '#666',
                fontWeight: isSelected ? 500 : 400,
              }}
            >
              {tab.label}
            </Button>
          );
        })}
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
              style={{ cursor: 'pointer', background: '#e6f4ff', color: '#1677ff' }}
            />
          </Dropdown>
        ) : (
          <Avatar
            size={40}
            icon={<UserOutlined />}
            style={{ cursor: 'pointer', background: '#e6f4ff', color: '#1677ff' }}
            onClick={onUserClick}
          />
        )}
      </div>
    </Header>
  );
};

export default HeaderComponent;
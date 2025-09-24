import React from 'react';
import { Layout, Avatar, Button, Dropdown, Menu, message } from 'antd';
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
    { key: 'news', icon: '📰', label: 'News' },
  ];

  const handleNewFeatureClick = (featureName: string) => {
    message.info(`${featureName}功能正在开发中`);
  };

  const handleTabChange = (tab: string) => {
    const routeMap: Record<string, string> = {
      'chat': '/chat',
      'kb': '/knowledgebase'
    };
    const route = routeMap[tab];
    if (route) {
      router.push(route);
    }
  };

  const handleAdminClick = () => {
    router.push('/admin');
  };

  return (
    <Header 
      style={{ 
        background: '#fff', 
        padding: '0 24px', 
        position: 'relative', 
        height: 64, 
        boxShadow: '0 2px 8px #f0f1f2',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      {/* 左上角Logo */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{
          width: 32,
          height: 32,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: 16,
          fontWeight: 'bold',
          marginRight: 12
        }}>
          AI
        </div>
        <span style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>
          Chat Studio
        </span>
      </div>

      {/* 悬浮胶囊按钮 */}
      <div style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        background: '#f5f5f5',
        borderRadius: 32,
        boxShadow: '0 4px 16px rgba(0,0,0,0.10), 0 1.5px 6px rgba(0,0,0,0.08)',
        display: 'flex',
        alignItems: 'center',
        padding: '4px 8px',
        zIndex: 10,
      }}>
        {capsuleTabs.map((tab, idx) => {
          const isNewFeature = ['agent', 'mcp', 'workflow', 'bi', 'news'].includes(tab.key);
          return (
            <Button
              key={tab.key}
              type={selectedTab === tab.key ? 'primary' : 'text'}
              style={{
                borderRadius: 32,
                marginLeft: idx === 0 ? 0 : 4,
                marginRight: idx === capsuleTabs.length - 1 ? 0 : 4,
                fontWeight: selectedTab === tab.key ? 'bold' : undefined,
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
              onClick={() => {
                if (isNewFeature) {
                  handleNewFeatureClick(tab.label);
                } else {
                  handleTabChange(tab.key);
                }
              }}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </Button>
          );
        })}
      </div>

      {/* 右上角用户按钮 */}
      <div>
        {isLogin ? (
          <Dropdown
            overlay={
              <Menu style={{ width: 200 }}>
                <Menu.Item key="settings" icon={<SettingOutlined />} onClick={onSettingsClick}>
                  设置
                </Menu.Item>
                {userInfo?.userRole === 'ADMIN' && (
                  <Menu.Item key="admin" icon={<CrownOutlined />} onClick={handleAdminClick}>
                    管理员设置
                  </Menu.Item>
                )}
                <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={onLogout}>
                  登出
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item key="online" disabled>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, backgroundColor: '#52c41a', borderRadius: '50%' }}></div>
                    当前在线用户: 1
                  </div>
                </Menu.Item>
              </Menu>
            }
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
import React from 'react';
import { Layout, Avatar, Button, Dropdown, message, theme, Divider, Tag, Flex, Typography } from 'antd';
import type { MenuProps } from 'antd';
import { UserOutlined, SettingOutlined, LogoutOutlined, CrownOutlined, AppstoreOutlined, RocketOutlined, UpOutlined, DownOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import classNames from 'classnames';
import styles from './Header.module.css';

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
  const [collapsed, setCollapsed] = React.useState(false);

  const workbenchTabs = [
    { key: 'chat', icon: '💬', label: '聊天' },
    { key: 'kb', icon: '📚', label: '知识库' },
    { key: 'mcp', icon: '🔗', label: 'MCP' },
  ];

  const advancedTabs = [
    { key: 'workflow', icon: '⚡', label: '工作流' },
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
        <div className={styles.onlineStatusItem}>
          <div className={styles.onlineStatusDot}></div>
          当前在线用户: 1
        </div>
      ),
      disabled: true,
    },
  ];

  const renderTabButton = (tab: { key: string; icon: string; label: string }) => {
    const isSelected = selectedTab === tab.key;
    return (
      <div className={styles.tabButtonWrapper} key={tab.key}>
        <Button
          type="text"
          icon={<span className={styles.tabIcon}>{tab.icon}</span>}
          onClick={() => {
            if (tab.key === 'chat') router.push('/chat');
            else if (tab.key === 'kb') router.push('/knowledgebase');
            else if (tab.key === 'mcp') router.push('/mcp');
            else handleNewFeatureClick(tab.label);
          }}
          className={classNames(styles.tabButton, {
            [styles.tabButtonSelected]: isSelected,
            [styles.tabButtonNormal]: !isSelected,
          })}
        >
          {tab.label}
        </Button>
        {isSelected && (
          <div className={styles.tabIndicator} />
        )}
      </div>
    );
  };

  return (
    <Header
      className={classNames(styles.header, { [styles.headerCollapsed]: collapsed })}
    >
      <div className={classNames(styles.innerContainer, { [styles.innerContainerCollapsed]: collapsed })}>
        <div className={styles.logo}>
          Chat Studio
        </div>

        <div className={styles.tabsWrapper}>
          <div className={styles.tabsContainer}>
            {/* 工作台分组 */}
            <Flex align="center" gap={4} className={styles.tabGroup}>
              {workbenchTabs.map(renderTabButton)}
            </Flex>

            <Divider orientation="vertical" />

            {/* 高级功能分组 */}
            <Flex align="center" gap={4}>
              {advancedTabs.map(renderTabButton)}
            </Flex>
          </div>
        </div>

        {/* 右上角用户按钮 */}
        <div className={styles.userContainer}>
          {isLogin ? (
            <Dropdown
              menu={{ items: menuItems, className: styles.dropdownMenu }}
              trigger={['click']}
              placement="bottomRight"
            >
              <Avatar
                size={40}
                icon={<UserOutlined />}
              />
            </Dropdown>
          ) : (
            <Avatar
              size={40}
              icon={<UserOutlined />}
              onClick={onUserClick}
            />
          )}
        </div>
      </div>

      {/* 收起/展开按钮 */}
      <div
        onClick={() => setCollapsed(!collapsed)}
        className={styles.collapseButton}
      >
        {collapsed ? <DownOutlined /> : <UpOutlined />}
      </div>
    </Header>
  );
};

export default HeaderComponent;

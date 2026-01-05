import React, { useState, useEffect } from 'react';
import { Modal, Menu, Space } from 'antd';
import { SettingOutlined, AppstoreOutlined, SkinOutlined, RobotOutlined, UserOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { UserInfo } from '../lib/api';
import GeneralPanel from './settings/GeneralPanel';
import InterfacePanel from './settings/InterfacePanel';
import ModelPanel from './settings/ModelProviderPanel';
import ModelListPanel from './settings/ModelListPanel';
import AccountPanel from './settings/AccountPanel';
import AboutPanel from './settings/AboutPanel';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  userInfo: UserInfo | null;
}

type SettingTab = 'general' | 'interface' | 'model' | 'modelList' | 'account' | 'about';

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  open, 
  onClose,
  userInfo
}) => {
  const [activeTab, setActiveTab] = useState<SettingTab>('general');

  // 每次打开弹窗时重置到默认面板
  useEffect(() => {
    if (open) {
      setActiveTab('general');
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
      label: '提供商',
    },
    {
      key: 'modelList',
      icon: <AppstoreOutlined />,
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
        return <GeneralPanel />;
      case 'interface':
        return <InterfacePanel />;
      case 'model':
        return <ModelPanel />;
      case 'modelList':
        return <ModelListPanel />;
      case 'account':
        return <AccountPanel userInfo={userInfo} />;
      case 'about':
        return <AboutPanel />;
      default:
        return null;
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      maskClosable={true}
      closable={true}
      title={
        <Space>
          <SettingOutlined />
          设置
        </Space>
      }
      width="80%"
      styles={{
        body: { padding: 0, height: '80vh' }
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
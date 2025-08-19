import React, { useState, useEffect } from 'react';
import { Modal, Switch, Divider, Space } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { UserInfo } from '../src/api';

interface SettingsModalProps {
  open: boolean;
  onCancel: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  open, 
  onCancel
}) => {

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
      width={400}
    >

      <div>
        <div style={{ marginBottom: 16 }}>
          <h4>用户信息</h4>
          <p>用户名: {userInfo?.nickName || 'Chat Studio User'}</p>
          <p>邮箱: {userInfo?.email || 'user@chatstudio.com'}</p>
          <p>角色: {userInfo?.userRole === 'ADMIN' ? '管理员' : '普通用户'}</p>
        </div>
        
        <Divider />
        
        <div style={{ marginBottom: 16 }}>
          <h4>应用设置</h4>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>消息通知</span>
              <Switch defaultChecked />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>自动保存对话</span>
              <Switch defaultChecked />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>深色模式</span>
              <Switch />
            </div>
          </Space>
        </div>
        

      </div>
    </Modal>
  );
};

export default SettingsModal;
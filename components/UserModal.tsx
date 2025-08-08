import React from 'react';
import { Modal, Button, Form, Input, Switch, Divider, Space } from 'antd';
import { UserOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons';

interface UserModalProps {
  open: boolean;
  onCancel: () => void;
  isLogin: boolean;
  onLogin: () => void;
  onLogout: () => void;
}

const UserModal: React.FC<UserModalProps> = ({ 
  open, 
  onCancel, 
  isLogin, 
  onLogin, 
  onLogout 
}) => {
  const [form] = Form.useForm();

  const handleLogin = () => {
    form.validateFields().then(() => {
      onLogin();
      onCancel();
    });
  };

  const handleLogout = () => {
    onLogout();
    onCancel();
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      title={
        <Space>
          {isLogin ? <SettingOutlined /> : <UserOutlined />}
          {isLogin ? '设置' : '登录'}
        </Space>
      }
      width={400}
    >
      {isLogin ? (
        <div>
          <div style={{ marginBottom: 16 }}>
            <h4>用户信息</h4>
            <p>用户名: Chat Studio User</p>
            <p>邮箱: user@chatstudio.com</p>
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
          
          <Divider />
          
          <Button 
            type="primary" 
            danger 
            icon={<LogoutOutlined />} 
            onClick={handleLogout}
            block
          >
            退出登录
          </Button>
        </div>
      ) : (
        <Form form={form} layout="vertical">
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="请输入用户名" />
          </Form.Item>
          
          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password placeholder="请输入密码" />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" onClick={handleLogin} block>
              登录
            </Button>
          </Form.Item>
          
          <div style={{ textAlign: 'center' }}>
            <Button type="link" onClick={handleLogin}>
              一键登录（演示模式）
            </Button>
          </div>
        </Form>
      )}
    </Modal>
  );
};

export default UserModal; 
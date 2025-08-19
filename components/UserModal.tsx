import React, { useState } from 'react';
import { Modal, Button, Form, Input, Space, Tabs, message } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, GiftOutlined, SendOutlined } from '@ant-design/icons';
import { login, register, sendCode, LoginRequest, RegisterRequest, AuthResponse } from '@/lib/api';

interface UserModalProps {
  open: boolean;
  onCancel: () => void;
  onLogin: () => void;
}

const UserModal: React.FC<UserModalProps> = ({ 
  open, 
  onCancel, 
  onLogin 
}) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);


  // 倒计时逻辑
  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 发送验证码
  const handleSendCode = async () => {
    try {
      const email = form.getFieldValue('registerEmail');
      if (!email) {
        messageApi.error('请先输入邮箱');
        return;
      }

      // 简单的邮箱格式验证
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        messageApi.error('请输入有效的邮箱地址');
        return;
      }

      setLoading(true);
      await sendCode(email);
      messageApi.success('验证码已发送，请查收邮箱');
      startCountdown();
    } catch (error) {
      messageApi.error('发送验证码失败: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      const loginData: LoginRequest = {
        email: values.email,
        password: values.password,
      };
      
      const res = await login(loginData);
      
      // 保存token到localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', (res as unknown as AuthResponse).tokenValue);
        localStorage.setItem('userInfo', JSON.stringify((res as unknown as AuthResponse).userInfo));
      }
      
      messageApi.success('登录成功');
      onLogin();
      onCancel();
    } catch (error) {
      messageApi.error('登录失败: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      const registerData: RegisterRequest = {
        email: values.registerEmail,
        pwd: values.registerPassword,
        captcha: values.captcha,
      };
      
      // 如果有邀请码，则添加到注册数据中
      if (values.inviteCode) {
        registerData.inviteCode = values.inviteCode;
      }
      
      await register(registerData);
      
      messageApi.success('注册成功');
      // 注册成功后切换到登录面板
      setActiveTab('login');
    } catch (error) {
      messageApi.error('注册失败: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };



  const onFinish = () => {
    if (activeTab === 'login') {
      handleLogin();
    } else {
      handleRegister();
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
          <UserOutlined />
          {activeTab === 'login' ? '登录' : '注册'}
        </Space>
      }
      width={400}
    >
      {contextHolder}
      <div>
        <div>
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            items={[
              {
                key: 'login',
                label: '登录',
              },
              {
                key: 'register',
                label: '注册',
              },
            ]}
          />
          
          <Form form={form} layout="vertical" onFinish={onFinish}>
            {activeTab === 'login' ? (
              <>
                <Form.Item
                  name="email"
                  label="邮箱"
                  rules={[
                    { required: true, message: '请输入邮箱' },
                    { type: 'email', message: '请输入有效的邮箱地址' }
                  ]}
                >
                  <Input prefix={<MailOutlined />} placeholder="请输入邮箱" />
                </Form.Item>
                
                <Form.Item
                  name="password"
                  label="密码"
                  rules={[{ required: true, message: '请输入密码' }]}
                >
                  <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" />
                </Form.Item>
              </>
            ) : (
              <>
                <Form.Item
                  name="registerEmail"
                  label="邮箱"
                  rules={[
                    { required: true, message: '请输入邮箱' },
                    { type: 'email', message: '请输入有效的邮箱地址' }
                  ]}
                >
                  <Input prefix={<MailOutlined />} placeholder="请输入邮箱" />
                </Form.Item>
                
                <Form.Item
                  name="registerPassword"
                  label="密码"
                  rules={[
                    { required: true, message: '请输入密码' },
                    { min: 6, message: '密码至少6位' }
                  ]}
                >
                  <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" />
                </Form.Item>
                
                <Form.Item
                  name="confirmPassword"
                  label="确认密码"
                  dependencies={['registerPassword']}
                  rules={[
                    { required: true, message: '请确认密码' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('registerPassword') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('两次输入的密码不一致'));
                      },
                    }),
                  ]}
                >
                  <Input.Password prefix={<LockOutlined />} placeholder="请确认密码" />
                </Form.Item>
                
                <Form.Item
                  label="验证码"
                  required
                  help="点击发送验证码按钮将验证码发送到您的邮箱"
                >
                  <Space.Compact style={{ width: '100%' }}>
                    <Form.Item
                      name="captcha"
                      noStyle
                      rules={[{ required: true, message: '请输入验证码' }]}
                    >
                      <Input placeholder="请输入验证码" />
                    </Form.Item>
                    <Button 
                      icon={<SendOutlined />} 
                      onClick={handleSendCode}
                      loading={loading}
                      disabled={countdown > 0}
                    >
                      {countdown > 0 ? `${countdown}秒后重试` : '发送验证码'}
                    </Button>
                  </Space.Compact>
                </Form.Item>
                
                <Form.Item
                  name="inviteCode"
                  label="邀请码（选填）"
                >
                  <Input prefix={<GiftOutlined />} placeholder="请输入邀请码" />
                </Form.Item>
              </>
            )}
            
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block>
                {activeTab === 'login' ? '登录' : '注册'}
              </Button>
            </Form.Item>
            
            {activeTab === 'login' && (
              <div style={{ textAlign: 'center' }}>
                <Button type="link" onClick={() => handleLogin()}>
                  一键登录（演示模式）
                </Button>
              </div>
            )}
          </Form>
        </div>
      </div>
    </Modal>
  );
};

export default UserModal;
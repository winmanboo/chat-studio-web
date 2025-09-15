import React, { useState } from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import { installModel, ModelProvider } from '../../lib/api/models';

interface InstallModelModalProps {
  open: boolean;
  onClose: () => void;
  provider: ModelProvider | null;
  onInstallSuccess?: () => void;
}

const InstallModelModal: React.FC<InstallModelModalProps> = ({
  open,
  onClose,
  provider,
  onInstallSuccess
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleInstall = async (values: { apiKey: string }) => {
    if (!provider) return;
    
    setLoading(true);
    try {
      const result = await installModel(provider.id, values.apiKey);
      if (result.success) {
        message.success('模型安装成功！');
        form.resetFields();
        onClose();
        onInstallSuccess?.();
      } else {
        message.error(result.message || '安装失败，请重试');
      }
    } catch (error: any) {
      console.error('安装模型失败:', error);
      // 优先显示响应中的msg字段，处理response为null的情况
      let errorMessage = '安装失败，请检查网络连接或API Key是否正确';
      
      if (error?.response?.data?.msg) {
        errorMessage = error.response.data.msg;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.response === null) {
        errorMessage = '网络连接失败，请检查网络连接后重试';
      }
      
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={`安装 ${provider?.providerName || '模型'}`}
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={500}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleInstall}
        size="large"
      >
        <Form.Item
          label="API Key"
          name="apiKey"
          rules={[
            { required: true, message: '请输入API Key' },
            { min: 10, message: 'API Key长度至少为10个字符' }
          ]}
        >
          <Input.Password
            placeholder="请输入您的API Key"
            autoComplete="off"
          />
        </Form.Item>
        
        {provider?.desc && (
          <div style={{ marginBottom: 16, color: '#666', fontSize: '14px' }}>
            {provider.desc}
          </div>
        )}
        
        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <Button onClick={handleCancel} style={{ marginRight: 8 }}>
            取消
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            安装
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default InstallModelModal;
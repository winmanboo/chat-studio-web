import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Space, message } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { InstalledModel } from '../../lib/api';

interface ModelSettingsModalProps {
  open: boolean;
  onClose: () => void;
  model: InstalledModel | null;
}

interface ModelSettings {
  apiKey: string;
  baseUrl: string;
}

const ModelSettingsModal: React.FC<ModelSettingsModalProps> = ({
  open,
  onClose,
  model
}) => {
  const [form] = Form.useForm<ModelSettings>();
  const [loading, setLoading] = useState(false);

  // 当模型变化时重置表单
  useEffect(() => {
    if (model && open) {
      form.setFieldsValue({
        apiKey: '',
        baseUrl: ''
      });
    }
  }, [model, open, form]);

  // 保存设置
  const handleSave = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      // TODO: 调用API保存模型设置
      console.log('保存模型设置:', {
        modelId: model?.id,
        ...values
      });
      
      message.success('模型设置保存成功');
      onClose();
    } catch (error) {
      console.error('保存模型设置失败:', error);
      message.error('保存模型设置失败');
    } finally {
      setLoading(false);
    }
  };

  // 取消设置
  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      title={
        <Space>
          <SettingOutlined />
          模型设置 - {model?.modelInstalledName}
        </Space>
      }
      width={600}
      footer={
        <Space>
          <Button onClick={handleCancel}>
            取消
          </Button>
          <Button 
            type="primary" 
            loading={loading}
            onClick={handleSave}
          >
            保存
          </Button>
        </Space>
      }
      maskClosable={false}
    >
      <Form
        form={form}
        layout="horizontal"
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        style={{ marginTop: 24 }}
      >
        <Form.Item
          label="API Key"
          name="apiKey"
          rules={[
            { required: true, message: '请输入API Key' },
            { min: 10, message: 'API Key长度至少10个字符' }
          ]}
        >
          <Input.Password 
            placeholder="请输入模型的API Key"
            size="large"
          />
        </Form.Item>

        <Form.Item
          label="Base URL"
          name="baseUrl"
          rules={[
            { required: true, message: '请输入Base URL' },
            { type: 'url', message: '请输入有效的URL地址' }
          ]}
        >
          <Input 
            placeholder="请输入模型的Base URL，如：https://api.openai.com/v1"
            size="large"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModelSettingsModal;
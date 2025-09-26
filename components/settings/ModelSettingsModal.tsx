import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Space, message } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { InstalledModel, modifyModelSettings, getModelSettings } from '../../lib/api';

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

  // 当模型变化时加载配置信息
  useEffect(() => {
    const loadModelSettings = async () => {
      if (model && open) {
        try {
          // 获取模型配置信息
          const settings = await getModelSettings(model.providerId);
          // 添加额外的安全检查
          if (settings && typeof settings === 'object') {
            form.setFieldsValue({
              apiKey: settings.apiKey || '',
              baseUrl: settings.baseUrl || ''
            });
          } else {
            // 如果返回的数据格式不正确，设置为空值
            form.setFieldsValue({
              apiKey: '',
              baseUrl: ''
            });
          }
        } catch (error) {
          console.error('加载模型配置失败:', error);
          // 如果获取失败，设置为空值
          form.setFieldsValue({
            apiKey: '',
            baseUrl: ''
          });
        }
      }
    };

    loadModelSettings();
  }, [model, open, form]);

  // 保存设置
  const handleSave = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      if (!model) {
        message.error('模型信息不存在');
        return;
      }
      
      // 调用API保存模型设置
      await modifyModelSettings(
        model.id,
        model.providerId,
        values.apiKey,
        values.baseUrl
      );
      
      message.success('模型设置保存成功');
      form.resetFields();
      onClose();
    } catch (error: any) {
      console.error('保存模型设置失败:', error);
      
      let errorMessage = '保存失败，请检查网络连接';
      
      if (error?.response?.data?.msg) {
        errorMessage = error.response.data.msg;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      message.error(errorMessage);
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
import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, message, Switch, InputNumber, Slider, Row, Col, Divider, Tooltip, Space, theme } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { installModel, ModelProvider, ModelSettings } from '../../lib/api/models';

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
  const { token } = theme.useToken();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [useDefaultSettings, setUseDefaultSettings] = useState(true);

  // 监听 useDefault 字段变化
  const useDefaultValue = Form.useWatch('useDefault', form);

  useEffect(() => {
    if (useDefaultValue !== undefined) {
      setUseDefaultSettings(useDefaultValue);
    }
  }, [useDefaultValue]);

  // 重置表单
  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        useDefault: true,
        temperature: 0.7,
        topP: 1.0,
        frequencyPenalty: 0,
        presencePenalty: 0
      });
      setUseDefaultSettings(true);
    }
  }, [open, form]);

  const handleInstall = async (values: any) => {
    if (!provider) return;
    
    setLoading(true);
    try {
      // 提取 apiKey，其余作为 settings
      const { apiKey, ...settings } = values;
      
      await installModel(provider.id, apiKey, settings);
      message.success('模型安装成功！');
      form.resetFields();
      onClose();
      onInstallSuccess?.();
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

  // 渲染 Slider 和 InputNumber 的组合控件
  const renderSliderInput = (
    name: string, 
    label: string, 
    min: number, 
    max: number, 
    step: number, 
    help?: string
  ) => (
    <Form.Item label={
      <Space>
        {label}
        {help && (
          <Tooltip title={help} overlayStyle={{ maxWidth: 360 }}>
            <QuestionCircleOutlined style={{ color: token.colorTextTertiary, cursor: 'help' }} />
          </Tooltip>
        )}
      </Space>
    }>
      <Row gutter={16}>
        <Col span={16}>
          <Form.Item name={name} noStyle>
            <Slider min={min} max={max} step={step} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name={name} noStyle>
            <InputNumber min={min} max={max} step={step} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>
    </Form.Item>
  );

  return (
    <Modal
      title={`安装 ${provider?.providerName || '模型'}`}
      open={open}
      onCancel={handleCancel}
      footer={
        <Space>
          <Button onClick={handleCancel}>
            取消
          </Button>
          <Button 
            type="primary" 
            loading={loading}
            onClick={() => form.submit()}
          >
            安装
          </Button>
        </Space>
      }
      width={640}
      destroyOnHidden
      maskClosable={false}
    >
      <Form
        form={form}
        layout="horizontal"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        style={{ marginTop: 24 }}
        onFinish={handleInstall}
        initialValues={{ 
          useDefault: true,
          temperature: 0.7,
          topP: 1.0,
          frequencyPenalty: 0,
          presencePenalty: 0
        }}
      >
        {provider?.description && (
          <div
            style={{ marginBottom: 24, color: token.colorTextSecondary, fontSize: 14 }}
          >
            {provider.description}
          </div>
        )}

        <Divider orientation='horizontal'>基础连接配置</Divider>
        
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
            size="large"
          />
        </Form.Item>
        
        {/* 移除 Base URL 字段 */}
        
        <Divider orientation='horizontal'>模型推理参数</Divider>

        <Form.Item
          label="使用默认参数"
          name="useDefault"
          valuePropName="checked"
          extra="开启后将使用模型提供商推荐的默认参数进行对话"
        >
          <Switch />
        </Form.Item>

        {!useDefaultSettings && (
          <div style={{ 
            background: token.colorFillQuaternary, 
            padding: '20px 20px 4px 20px', 
            borderRadius: token.borderRadiusLG,
            marginBottom: 24
          }}>
            <Form.Item
              label="Max Tokens"
              name="maxTokens"
              tooltip="单次交互生成的最大 Token 数量限制"
            >
              <InputNumber 
                placeholder="不限制" 
                style={{ width: '100%' }} 
                min={1}
                precision={0}
              />
            </Form.Item>

            {renderSliderInput(
              "temperature", 
              "Temperature", 
              0, 2, 0.1, 
              "采样温度，控制输出的随机性。较高的值（如 0.8）会使输出更随机，而较低的值（如 0.2）会使其更集中和确定。"
            )}

            {renderSliderInput(
              "topP", 
              "Top P", 
              0, 1, 0.01, 
              "核采样。模型会考虑概率质量为 Top P 的 token 结果。0.1 意味着只考虑前 10% 概率质量的 token。"
            )}
            
            {renderSliderInput(
              "frequencyPenalty", 
              "Frequency Penalty", 
              -2, 2, 0.1, 
              "频率惩罚。正值会根据新 token 在文本中出现的现有频率对其进行惩罚，从而降低模型逐字重复同一行的可能性。"
            )}

            {renderSliderInput(
              "presencePenalty", 
              "Presence Penalty", 
              -2, 2, 0.1, 
              "存在惩罚。正值会根据新 token 到目前为止是否出现在文本中对其进行惩罚，从而增加模型谈论新主题的可能性。"
            )}

            <Form.Item
              label="Stop Sequences"
              name="stopSequences"
              tooltip="停止序列，当模型生成这些字符时停止生成。多个序列请用逗号分隔。"
            >
              <Input placeholder="例如: user:, assistant: (使用英文逗号分隔)" />
            </Form.Item>
          </div>
        )}
      </Form>
    </Modal>
  );
};

export default InstallModelModal;
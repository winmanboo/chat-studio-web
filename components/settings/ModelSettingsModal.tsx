import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Space, message, Switch, InputNumber, Slider, Row, Col, Divider, Tooltip, Typography, theme } from 'antd';
import { SettingOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { InstalledModel, modifyModelSettings, getModelSettings, ModelSettings } from '../../lib/api';

const { Text } = Typography;

interface ModelSettingsModalProps {
  open: boolean;
  onClose: () => void;
  model: InstalledModel | null;
}

const ModelSettingsModal: React.FC<ModelSettingsModalProps> = ({
  open,
  onClose,
  model
}) => {
  const { token } = theme.useToken();
  const [form] = Form.useForm<ModelSettings>();
  const [loading, setLoading] = useState(false);
  const [useDefaultSettings, setUseDefaultSettings] = useState(true);

  // 监听 useDefault 字段变化
  const useDefaultValue = Form.useWatch('useDefault', form);

  useEffect(() => {
    if (useDefaultValue !== undefined) {
      setUseDefaultSettings(useDefaultValue);
    }
  }, [useDefaultValue]);

  // 当模型变化时加载配置信息
  useEffect(() => {
    const loadModelSettings = async () => {
      if (model && open) {
        try {
          // 获取模型配置信息
          const settings = await getModelSettings(model.providerId);
          
          // 默认值处理
          const initialValues: ModelSettings = {
            apiKey: settings?.apiKey || '',
            baseUrl: settings?.baseUrl || '',
            useDefault: settings?.useDefault ?? true,
            maxTokens: settings?.maxTokens,
            temperature: settings?.temperature ?? 0.7,
            topK: settings?.topK,
            topP: settings?.topP ?? 1.0,
            stopSequences: settings?.stopSequences || '',
            frequencyPenalty: settings?.frequencyPenalty ?? 0,
            presencePenalty: settings?.presencePenalty ?? 0,
          };

          form.setFieldsValue(initialValues);
          setUseDefaultSettings(initialValues.useDefault || false);
        } catch (error) {
          console.error('加载模型配置失败:', error);
          // 如果获取失败，设置为空值
          form.setFieldsValue({
            apiKey: '',
            baseUrl: '',
            useDefault: true
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
        values
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
      open={open}
      onCancel={handleCancel}
      title={
        <Space>
          <SettingOutlined />
          <span style={{ fontWeight: 600 }}>模型设置</span>
          {model?.modelInstalledName && (
             <Text type="secondary" style={{ fontSize: 14, fontWeight: 400 }}>
               - {model.modelInstalledName}
             </Text>
          )}
        </Space>
      }
      width={640}
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
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        style={{ marginTop: 24 }}
        initialValues={{ useDefault: true }}
      >
        <Divider orientation='horizontal'>基础连接配置</Divider>
        
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
            placeholder="请输入模型的Base URL"
            size="large"
          />
        </Form.Item>

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
            
            <Form.Item
              label="Top K"
              name="topK"
              tooltip="仅从概率最高的 K 个 token 中进行采样"
            >
              <InputNumber 
                placeholder="默认" 
                style={{ width: '100%' }} 
                min={1}
                precision={0}
              />
            </Form.Item>

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

export default ModelSettingsModal;

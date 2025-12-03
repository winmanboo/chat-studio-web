'use client';

import React, { useState } from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Switch,
  Button,
  Space,
  message,
  Typography,
  Alert,
  Tooltip,
  theme,
  Divider
} from 'antd';
import { 
  LinkOutlined, 
  DatabaseOutlined, 
  InfoCircleOutlined,
  SettingOutlined,
  ShareAltOutlined,
  LockOutlined
} from '@ant-design/icons';
import { createMCPServer, testMCPServerConnection, CreateMCPServerRequest } from '@/lib/api/mcp';

const { TextArea } = Input;
const { Text, Title } = Typography;

interface AddMCPServerModalProps {
  visible: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

const AddMCPServerModal: React.FC<AddMCPServerModalProps> = ({
  visible,
  onSuccess,
  onCancel,
}) => {
  const { token } = theme.useToken();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // 测试连接
  const handleTestConnection = async () => {
    try {
      const endpoint = form.getFieldValue('endpoint');
      if (!endpoint) {
        message.warning('请先输入服务端点');
        return;
      }

      setTesting(true);
      setTestResult(null);
      
      const result = await testMCPServerConnection(endpoint);
      setTestResult(result);
      
      if (result.success) {
        message.success('连接测试成功');
      } else {
        message.error(`连接测试失败: ${result.message}`);
      }
    } catch (error) {
      message.error('连接测试失败');
      setTestResult({ success: false, message: '网络错误或服务不可用' });
      console.error('Connection test failed:', error);
    } finally {
      setTesting(false);
    }
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const serverData: CreateMCPServerRequest = {
        endpoint: values.endpoint,
        serverName: values.serverName,
        bizName: values.bizName,
        timeout: values.timeout || 60,
        sseTimeout: values.sseTimeout || 300,
        description: values.description || '',
        shared: values.shared || false,
      };

      await createMCPServer(serverData);
      onSuccess();
      form.resetFields();
      setTestResult(null);
    } catch (error) {
      message.error('添加 MCP 服务器失败');
      console.error('Failed to create MCP server:', error);
    } finally {
      setLoading(false);
    }
  };

  // 取消操作
  const handleCancel = () => {
    form.resetFields();
    setTestResult(null);
    onCancel();
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{ 
            width: 40, 
            height: 40, 
            background: token.colorPrimaryBg, 
            borderRadius: token.borderRadius,
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center'
          }}>
            <DatabaseOutlined style={{ fontSize: 20, color: token.colorPrimary }} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: token.colorText }}>
              添加 MCP 服务器
            </div>
            <div style={{ fontSize: 12, color: token.colorTextSecondary, fontWeight: 'normal' }}>
              配置新的 Model Context Protocol 服务器
            </div>
          </div>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      width={640}
      styles={{
        body: { padding: '24px 0 0 0' }
      }}
      footer={
        <div style={{ 
          padding: '16px 24px', 
          borderTop: `1px solid ${token.colorBorderSecondary}`,
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 8,
          background: token.colorBgContainer
        }}>
          <Button onClick={handleCancel}>取消</Button>
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={loading}
          >
            添加服务器
          </Button>
        </div>
      }
    >
      <div style={{ padding: '0 24px 24px 24px' }}>
        {/* 连接测试结果 */}
        {testResult && (
          <Alert
            type={testResult.success ? 'success' : 'error'}
            message={testResult.success ? '连接测试成功' : '连接测试失败'}
            description={testResult.message}
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}

        <Form
          form={form}
          layout="vertical"
          initialValues={{
            timeout: 60,
            sseTimeout: 300,
            shared: false,
          }}
        >
          {/* 基础信息 */}
          <div style={{ 
            background: token.colorFillQuaternary, 
            padding: 20, 
            borderRadius: token.borderRadiusLG,
            marginBottom: 24 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              <DatabaseOutlined style={{ marginRight: 8, color: token.colorPrimary }} />
              <Text strong>基础信息</Text>
            </div>

            <Form.Item
              name="endpoint"
              label="服务端点"
              rules={[
                { required: true, message: '请输入服务端点' },
                { type: 'url', message: '请输入有效的 URL' },
              ]}
            >
              <Input
                placeholder="https://your-mcp-server.com/api"
                prefix={<LinkOutlined style={{ color: token.colorTextPlaceholder }} />}
              />
            </Form.Item>

            <div style={{ display: 'flex', gap: 16 }}>
              <Form.Item
                name="serverName"
                label="服务名称"
                rules={[
                  { required: true, message: '请输入服务名称' },
                  { max: 50, message: '服务名称不能超过50个字符' },
                ]}
                style={{ flex: 1 }}
              >
                <Input placeholder="GPT-4 MCP Server" />
              </Form.Item>

              <Form.Item
                name="bizName"
                label={
                  <Space>
                    业务标识
                    <Tooltip title="用于标识模型的业务场景，例如 gpt-4-vision">
                      <InfoCircleOutlined style={{ color: token.colorTextPlaceholder }} />
                    </Tooltip>
                  </Space>
                }
                rules={[
                  { required: true, message: '请输入业务标识' },
                  { max: 30, message: '业务标识不能超过30个字符' },
                  { pattern: /^[a-zA-Z0-9_-]+$/, message: '只能包含字母、数字、下划线和连字符' },
                ]}
                style={{ flex: 1 }}
              >
                <Input placeholder="gpt4_mcp" />
              </Form.Item>
            </div>

            <Form.Item
              name="description"
              label="描述信息"
              style={{ marginBottom: 0 }}
            >
              <TextArea
                rows={2}
                placeholder="输入服务器描述信息（可选）"
                maxLength={200}
                showCount
                style={{ resize: 'none' }}
              />
            </Form.Item>
          </div>

          {/* 高级配置 */}
          <div style={{ 
            background: token.colorFillQuaternary, 
            padding: 20, 
            borderRadius: token.borderRadiusLG 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              <SettingOutlined style={{ marginRight: 8, color: token.colorWarning }} />
              <Text strong>高级配置</Text>
            </div>

            <div style={{ display: 'flex', gap: 16 }}>
              <Form.Item
                name="timeout"
                label={
                  <Space>
                    请求超时 (秒)
                    <Tooltip title="等待服务器响应的超时时间">
                      <InfoCircleOutlined style={{ color: token.colorTextPlaceholder }} />
                    </Tooltip>
                  </Space>
                }
                rules={[
                  { type: 'number', min: 1, max: 300, message: '请输入1-300之间的数值' },
                ]}
                style={{ flex: 1 }}
              >
                <InputNumber
                  min={1}
                  max={300}
                  placeholder="60"
                  style={{ width: '100%' }}
                />
              </Form.Item>

              <Form.Item
                name="sseTimeout"
                label={
                  <Space>
                    SSE 超时 (秒)
                    <Tooltip title="服务器发送事件流的超时时间">
                      <InfoCircleOutlined style={{ color: token.colorTextPlaceholder }} />
                    </Tooltip>
                  </Space>
                }
                rules={[
                  { type: 'number', min: 1, max: 3600, message: '请输入1-3600之间的数值' },
                ]}
                style={{ flex: 1 }}
              >
                <InputNumber
                  min={1}
                  max={3600}
                  placeholder="300"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </div>

            <Form.Item
              name="shared"
              label="共享设置"
              valuePropName="checked"
              style={{ marginBottom: 0 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Switch 
                  checkedChildren={<ShareAltOutlined />} 
                  unCheckedChildren={<LockOutlined />} 
                />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  允许其他用户使用此服务器
                </Text>
              </div>
            </Form.Item>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default AddMCPServerModal;

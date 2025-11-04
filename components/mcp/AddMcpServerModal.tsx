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
  Divider,
  Typography,
  Alert,
  Tooltip,
  Card,
  Avatar
} from 'antd';
import { 
  LinkOutlined, 
  TagOutlined, 
  ClockCircleOutlined,
  ShareAltOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  DatabaseOutlined,
  ThunderboltOutlined,
  CloudOutlined,
  InfoCircleOutlined,
  SettingOutlined,
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
        <div className="flex items-center space-x-3 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <DatabaseOutlined className="text-white text-lg" />
          </div>
          <div>
            <Text strong className="text-lg text-gray-900">
              添加 MCP 服务器
            </Text>
            <br />
            <Text className="text-sm text-gray-500">
              配置新的 Model Context Protocol 服务器
            </Text>
          </div>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      width={600}
      centered
      className="rounded-2xl"
      styles={{
        body: {
          padding: 0,
          maxHeight: '60vh',
          overflowY: 'auto'
        }
      }}
      footer={
        <div className="flex justify-end items-center px-6 py-4 border-t border-gray-100 bg-gray-50">
          <Space>
            <Button onClick={handleCancel} className="rounded-lg">
              取消
            </Button>
            <Button
              type="primary"
              onClick={handleSubmit}
              loading={loading}
              className="rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 border-0"
            >
              添加服务器
            </Button>
          </Space>
        </div>
      }
    >
      <div className="p-6 space-y-6">
        {/* 连接测试结果 */}
        {testResult && (
          <Alert
            type={testResult.success ? 'success' : 'error'}
            message={testResult.success ? '连接测试成功' : '连接测试失败'}
            description={testResult.message}
            showIcon
            className="rounded-lg"
          />
        )}

        <Form
          form={form}
          layout="vertical"
          className="space-y-2"
          initialValues={{
            timeout: 60,
            sseTimeout: 300,
            shared: false,
          }}
        >
          {/* 基础信息 */}
          <div className="bg-gray-50 rounded-xl p-5 space-y-3">
            <Text strong className="text-gray-900 flex items-center text-base">
              <DatabaseOutlined className="mr-2 text-blue-500" />
              基础信息
            </Text>

            <Form.Item
              name="endpoint"
              label="服务端点"
              rules={[
                { required: true, message: '请输入服务端点' },
                { type: 'url', message: '请输入有效的 URL' },
              ]}
              className="mb-3"
            >
              <Input
                placeholder="https://your-mcp-server.com/api"
                prefix={<LinkOutlined className="text-gray-400" />}
                size="large"
                className="rounded-lg"
              />
            </Form.Item>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
              <Form.Item
                name="serverName"
                label="服务名称"
                rules={[
                  { required: true, message: '请输入服务名称' },
                  { max: 50, message: '服务名称不能超过50个字符' },
                ]}
                className="mb-3"
              >
                <Input 
                  placeholder="GPT-4 MCP Server" 
                  size="large"
                  className="rounded-lg"
                />
              </Form.Item>

              <Form.Item
                name="bizName"
                label={
                  <Space>
                    业务标识
                    <Tooltip title="用于标识模型的业务场景，例如 gpt-4-vision">
                      <InfoCircleOutlined className="text-gray-400" />
                    </Tooltip>
                  </Space>
                }
                rules={[
                  { required: true, message: '请输入业务标识' },
                  { max: 30, message: '业务标识不能超过30个字符' },
                  { pattern: /^[a-zA-Z0-9_-]+$/, message: '只能包含字母、数字、下划线和连字符' },
                ]}
                className="mb-3"
              >
                <Input 
                  placeholder="gpt4_mcp" 
                  size="large"
                  className="rounded-lg"
                />
              </Form.Item>
            </div>

            <Form.Item
              name="description"
              label="描述信息"
              className="mb-0"
            >
              <TextArea
                rows={2}
                placeholder="输入服务器描述信息（可选）"
                maxLength={200}
                showCount
                className="rounded-lg"
              />
            </Form.Item>
          </div>

          {/* 高级配置 */}
          <div className="bg-gray-50 rounded-xl p-5 space-y-3">
            <Text strong className="text-gray-900 flex items-center text-base">
              <SettingOutlined className="mr-2 text-orange-500" />
              高级配置
            </Text>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
              <Form.Item
                name="timeout"
                label={
                  <Space>
                    请求超时 (秒)
                    <Tooltip title="等待服务器响应的超时时间">
                      <InfoCircleOutlined className="text-gray-400" />
                    </Tooltip>
                  </Space>
                }
                rules={[
                  { type: 'number', min: 1, max: 300, message: '请输入1-300之间的数值' },
                ]}
                className="mb-3"
              >
                <InputNumber
                  min={1}
                  max={300}
                  placeholder="60"
                  size="large"
                  className="w-full rounded-lg"
                />
              </Form.Item>

              <Form.Item
                name="sseTimeout"
                label={
                  <Space>
                    SSE 超时 (秒)
                    <Tooltip title="服务器发送事件流的超时时间">
                      <InfoCircleOutlined className="text-gray-400" />
                    </Tooltip>
                  </Space>
                }
                rules={[
                  { type: 'number', min: 1, max: 3600, message: '请输入1-3600之间的数值' },
                ]}
                className="mb-3"
              >
                <InputNumber
                  min={1}
                  max={3600}
                  placeholder="300"
                  size="large"
                  className="w-full rounded-lg"
                />
              </Form.Item>
            </div>

            <Form.Item
              name="shared"
              label="共享设置"
              valuePropName="checked"
              className="mb-0"
            >
              <div className="flex items-center space-x-3">
                <Switch 
                  checkedChildren={<ShareAltOutlined />} 
                  unCheckedChildren={<LockOutlined />} 
                />
                <Text className="text-sm text-gray-600">
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
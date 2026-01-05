import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Space, Tag, Popconfirm, Typography, Avatar, Tooltip, theme } from 'antd';
import { PlusOutlined, DeleteOutlined, ReloadOutlined, RobotOutlined, BulbOutlined, EyeOutlined, PictureOutlined, ToolOutlined, GlobalOutlined } from '@ant-design/icons';
import { getModelList, createModel, removeModel, ModelProviderWithModels, ModelListItem } from '../../lib/api/models';
import { DictItem, getDictItems } from '../../lib/api/common';

const { Title, Text } = Typography;

const ModelListPanel: React.FC = () => {
  const { token } = theme.useToken();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ModelProviderWithModels[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [abilityOptions, setAbilityOptions] = useState<DictItem[]>([]);

  useEffect(() => {
    // 获取能力字典
    const fetchDicts = async () => {
      try {
        const res = await getDictItems('ability_type');
        setAbilityOptions(res);
      } catch (error) {
        console.error('获取字典数据失败:', error);
      }
    };
    fetchDicts();
  }, []);

  const renderAbilityIcons = (abilities?: string) => {
    if (!abilities) return null;
    
    const abilityList = abilities.split(',').map(a => a.trim());
    const icons: React.ReactNode[] = [];
    
    if (abilityList.includes('THINKING')) {
      icons.push(
        <Tooltip key="thinking" title="深度思考">
          <BulbOutlined style={{ color: token.colorWarning }} />
        </Tooltip>
      );
    }
    
    if (abilityList.includes('VISUAL_UNDERSTANDING')) {
      icons.push(
        <Tooltip key="visual" title="视觉理解">
          <EyeOutlined style={{ color: token.colorSuccess }} />
        </Tooltip>
      );
    }
    
    if (abilityList.includes('IMAGE_GENERATION')) {
      icons.push(
        <Tooltip key="image" title="图片生成">
          <PictureOutlined style={{ color: token.purple6 }} />
        </Tooltip>
      );
    }
    
    if (abilityList.includes('TOOL')) {
      icons.push(
        <Tooltip key="tool" title="工具调用">
          <ToolOutlined style={{ color: token.colorInfo }} />
        </Tooltip>
      );
    }
    
    if (abilityList.includes('NETWORK')) {
      icons.push(
        <Tooltip key="network" title="联网搜索">
          <GlobalOutlined style={{ color: token.colorLink }} />
        </Tooltip>
      );
    }
    
    if (icons.length === 0) return null;
    
    return (
      <Space size={8}>
        {icons}
      </Space>
    );
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getModelList();
      setData(res);
    } catch (error) {
      console.error('获取模型列表失败:', error);
      message.error('获取模型列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async () => {
    try {
      setSubmitting(true);
      const values = await form.validateFields();
      await createModel(values);
      message.success('添加模型成功');
      setIsModalOpen(false);
      form.resetFields();
      fetchData();
    } catch (error: any) {
      console.error('添加模型失败:', error);
      message.error(error.message || '添加模型失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenModal = (providerId?: string) => {
    form.resetFields();
    if (providerId) {
      form.setFieldsValue({ providerId });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await removeModel(id);
      message.success('删除模型成功');
      fetchData();
    } catch (error: any) {
      console.error('删除模型失败:', error);
      message.error(error.message || '删除模型失败');
    }
  };

  const providerColumns = [
    {
      title: '提供商',
      dataIndex: 'providerName',
      key: 'providerName',
      render: (text: string, record: ModelProviderWithModels) => (
        <Space>
          <Avatar src={record.icon} shape="square" size="small" />
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>({record.models.length} 个模型)</Text>
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: any, record: ModelProviderWithModels) => (
        <Button 
          type="link" 
          icon={<PlusOutlined />} 
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            handleOpenModal(record.providerId);
          }}
        >
          新增模型
        </Button>
      ),
    },
  ];

  const expandedRowRender = (provider: ModelProviderWithModels) => {
    const modelColumns = [
      {
        title: '模型名称',
        dataIndex: 'modelName',
        key: 'modelName',
        render: (text: string, record: ModelListItem) => (
            <Space>
                <Text>{text}</Text>
                {record.def && <Tag color="blue">默认</Tag>}
            </Space>
        )
      },
      {
        title: '能力',
        dataIndex: 'abilities',
        key: 'abilities',
        render: (abilities: string) => renderAbilityIcons(abilities),
      },
      {
        title: '操作',
        key: 'action',
        width: 100,
        render: (_: any, record: ModelListItem) => (
          <Popconfirm
            title="确定要删除这个模型吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        ),
      },
    ];

    return (
      <Table
        columns={modelColumns}
        dataSource={provider.models}
        pagination={false}
        rowKey="id"
        size="small"
      />
    );
  };

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={5} style={{ margin: 0 }}>模型列表管理</Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading}>刷新</Button>
        </Space>
      </div>

      <Table
        dataSource={data}
        columns={providerColumns}
        rowKey="providerId"
        loading={loading}
        pagination={false}
        expandable={{
          expandedRowRender,
          defaultExpandAllRows: true,
        }}
        size="middle"
      />

      <Modal
        title="新增模型"
        open={isModalOpen}
        onOk={handleAdd}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={submitting}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="providerId"
            hidden
            rules={[{ required: true, message: 'Missing Provider ID' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="modelName"
            label="模型名称"
            rules={[{ required: true, message: '请输入模型名称' }]}
          >
            <Input placeholder="例如: gpt-4" />
          </Form.Item>

          <Form.Item
            name="abilities"
            label="模型能力"
          >
            <Select
              mode="multiple"
              placeholder="请选择模型能力"
              optionFilterProp="children"
            >
              {abilityOptions.map(item => (
                <Select.Option key={item.code} value={item.code}>
                  {item.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

        </Form>
      </Modal>
    </div>
  );
};

export default ModelListPanel;

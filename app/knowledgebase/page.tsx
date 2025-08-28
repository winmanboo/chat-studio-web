"use client";

import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Tag, Space, Dropdown, Pagination, Modal, message, Spin, Form, Select, Slider, Switch } from 'antd';
import { PlusOutlined, MoreOutlined, FileTextOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { getKnowledgeBasePage, deleteKnowledgeBase, createKnowledgeBase, getDictItems, getKnowledgeBaseTags, type KnowledgeBase, type CreateKnowledgeBaseParams, type DictItem, type TagItem } from '@/lib/api';

const { Search } = Input;

const KnowledgeBasePage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchValue, setSearchValue] = useState('');
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [retrievalModes, setRetrievalModes] = useState<DictItem[]>([]);
  const [splitStrategies, setSplitStrategies] = useState<DictItem[]>([]);
  const [availableTags, setAvailableTags] = useState<TagItem[]>([]);
  const [form] = Form.useForm();

  // 获取知识库数据
  const fetchKnowledgeBases = async () => {
    try {
      setLoading(true);
      const response = await getKnowledgeBasePage({
        pageNum: currentPage,
        pageSize,
        keyword: searchValue || undefined
      });
      setKnowledgeBases(response.records);
      setTotal(response.total);
    } catch (error) {
      message.error('获取知识库数据失败');
      console.error('Failed to fetch knowledge bases:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取字典数据
  const fetchDictData = async () => {
    try {
      const [retrievalData, splitData, tagsData] = await Promise.all([
        getDictItems('retrieval_mode'),
        getDictItems('split_strategy'),
        getKnowledgeBaseTags()
      ]);
      setRetrievalModes(retrievalData);
      setSplitStrategies(splitData);
      setAvailableTags(tagsData);
    } catch (error) {
      console.error('Failed to fetch dict data:', error);
      message.error('获取字典数据失败');
    }
  };

  // 页面加载时获取数据
  useEffect(() => {
    fetchKnowledgeBases();
  }, [currentPage, pageSize, searchValue]);

  // 搜索时重置到第一页
  const handleSearch = (value: string) => {
    setSearchValue(value);
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  // 菜单操作
  const handleMenuClick = (key: string, knowledgeBase: KnowledgeBase) => {
    switch (key) {
      case 'detail':
        Modal.info({
          title: '知识库详情',
          content: (
            <div>
              <p><strong>名称:</strong> {knowledgeBase.name}</p>
              <p><strong>更新时间:</strong> {knowledgeBase.updatedTime}</p>
              <p><strong>文档数:</strong> {knowledgeBase.docCount}</p>
              <p><strong>描述:</strong> {knowledgeBase.description}</p>
              <p><strong>标签:</strong> {knowledgeBase.tags.join(', ')}</p>
            </div>
          ),
        });
        break;
      case 'edit':
        message.info('编辑功能开发中...');
        break;
      case 'delete':
        Modal.confirm({
          title: '确认删除',
          content: `确定要删除知识库 "${knowledgeBase.name}" 吗？此操作不可撤销。`,
          okText: '确认',
          cancelText: '取消',
          onOk: async () => {
            try {
              await deleteKnowledgeBase(knowledgeBase.id);
              message.success('知识库删除成功');
              fetchKnowledgeBases(); // 重新获取数据
            } catch (error) {
              message.error('删除失败');
              console.error('Failed to delete knowledge base:', error);
            }
          },
        });
        break;
    }
  };

  const getMenuItems = (knowledgeBase: KnowledgeBase): MenuProps['items'] => [
    {
      key: 'detail',
      label: '详情',
      icon: <EyeOutlined />,
      onClick: () => handleMenuClick('detail', knowledgeBase),
    },
    {
      key: 'edit',
      label: '修改',
      icon: <EditOutlined />,
      onClick: () => handleMenuClick('edit', knowledgeBase),
    },
    {
      key: 'delete',
      label: '删除',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => handleMenuClick('delete', knowledgeBase),
    },
  ];

  // 添加知识库
  const handleAddKnowledgeBase = async () => {
    // 获取字典数据
    await fetchDictData();
    
    setCreateModalVisible(true);
    form.resetFields();
    // 设置默认值
    form.setFieldsValue({
      topK: 5,
      rerankEnabled: false,
      tags: []
    });
  };

  // 提交新增知识库
  const handleCreateSubmit = async () => {
    try {
      const values = await form.validateFields();
      setCreateLoading(true);
      
      // 处理标签数据格式
      const processedTags = values.tags?.map((tag: string) => {
        try {
          // 尝试解析为已有标签
          return JSON.parse(tag);
        } catch {
          // 如果解析失败，说明是新输入的标签
          return { name: tag };
        }
      }) || [];
      
      const params: CreateKnowledgeBaseParams = {
        name: values.name,
        description: values.description,
        retrievalMode: values.retrievalMode,
        splitStrategy: values.splitStrategy,
        topK: values.topK,
        rerankEnabled: values.rerankEnabled,
        tags: processedTags
      };
      
      await createKnowledgeBase(params);
      message.success('知识库创建成功');
      setCreateModalVisible(false);
      form.resetFields();
      fetchKnowledgeBases(); // 刷新列表
    } catch (error) {
      console.error('Failed to create knowledge base:', error);
      message.error('创建知识库失败');
    } finally {
      setCreateLoading(false);
    }
  };

  // 取消新增
  const handleCreateCancel = () => {
    setCreateModalVisible(false);
    form.resetFields();
  };

  return (
    <div style={{ height: '100vh', width: '100%', background: '#fff', color: '#222', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 24, flexShrink: 0 }}>
        <h2 style={{ marginBottom: 16, color: '#222' }}>知识库管理</h2>
        <Space style={{ marginBottom: 16 }}>
          <Search
            placeholder="搜索知识库"
            allowClear
            style={{ width: 300 }}
            onSearch={handleSearch}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </Space>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 24px' }}>
        {/* 卡片网格布局 */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          paddingBottom: 16
        }}>
          <Spin spinning={loading}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 16
            }}>
          {/* 添加知识库卡片 */}
          <Card
            hoverable
            style={{
              borderRadius: 12,
              border: '2px dashed #d9d9d9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 200,
              cursor: 'pointer'
            }}
            onClick={handleAddKnowledgeBase}
          >
            <div style={{ textAlign: 'center', color: '#999' }}>
              <PlusOutlined style={{ fontSize: 32, marginBottom: 8 }} />
              <div>添加知识库</div>
            </div>
          </Card>

          {/* 知识库卡片 */}
           {knowledgeBases.map((kb) => (
             <Card
               key={kb.id}
               hoverable
               style={{ borderRadius: 12, minHeight: 200, position: 'relative' }}
             >
               {/* 右上角菜单按钮 */}
               <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 1 }}>
                 <Dropdown
                   menu={{ items: getMenuItems(kb) }}
                   trigger={['click']}
                   placement="bottomRight"
                 >
                   <Button type="text" icon={<MoreOutlined />} size="small" />
                 </Dropdown>
               </div>

               <div style={{ marginBottom: 12 }}>
                 <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8, paddingRight: 32 }}>
                   <FileTextOutlined style={{ color: '#1890ff', marginRight: 8 }} />
                   <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{kb.name}</h3>
                 </div>
                 <p style={{ color: '#666', fontSize: 12, margin: 0 }}>更新时间: {new Date(kb.updatedTime).toLocaleDateString()}</p>
               </div>
               
               <div style={{ marginBottom: 12 }}>
                 <p style={{ color: '#666', fontSize: 14, margin: 0 }}>文档数: {kb.docCount}</p>
               </div>
 
               <div style={{ marginBottom: 12 }}>
                 {kb.tags.map(tag => (
                   <Tag key={tag} color="blue" style={{ marginBottom: 4 }}>
                     {tag}
                   </Tag>
                 ))}
               </div>
 
               {kb.description && (
                 <p style={{ color: '#999', fontSize: 12, margin: 0, lineHeight: 1.4 }}>
                   {kb.description}
                 </p>
               )}
             </Card>
            ))}
            </div>
          </Spin>
        </div>
 
        {/* 分页 - 固定在底部 */}
        <div style={{ 
          padding: '16px 0 24px', 
          borderTop: '1px solid #f0f0f0', 
          backgroundColor: '#fff',
          display: 'flex', 
          justifyContent: 'center' 
        }}>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={total}
            showSizeChanger
            showQuickJumper
            showTotal={(total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`}
            onChange={(page, size) => {
              setCurrentPage(page);
              if (size !== pageSize) {
                setPageSize(size);
                setCurrentPage(1);
              }
            }}
          />
        </div>
      </div>

      {/* 新增知识库模态框 */}
      <Modal
          title="新增知识库"
          open={createModalVisible}
          onOk={handleCreateSubmit}
          onCancel={handleCreateCancel}
          confirmLoading={createLoading}
          width={600}
          destroyOnHidden
          okText="保存"
          cancelText="关闭"
        >
        <Form
           form={form}
           layout="horizontal"
           labelCol={{ span: 6 }}
           wrapperCol={{ span: 18 }}
           requiredMark={false}
         >
          <Form.Item
             label="知识库名称"
             name="name"
             rules={[
               { required: true, message: '请输入知识库名称' },
               { max: 50, message: '知识库名称不能超过50个字符' }
             ]}
           >
             <Input placeholder="请输入知识库名称" />
           </Form.Item>

           <Form.Item
             label="检索模式"
             name="retrievalMode"
             rules={[{ required: true, message: '请选择检索模式' }]}
           >
             <Select placeholder="请选择检索模式">
               {retrievalModes.map(item => (
                 <Select.Option key={item.code} value={item.code}>
                   {item.name}
                 </Select.Option>
               ))}
             </Select>
           </Form.Item>

           <Form.Item
             label="分块策略"
             name="splitStrategy"
             rules={[{ required: true, message: '请选择分块策略' }]}
           >
             <Select placeholder="请选择分块策略">
               {splitStrategies.map(item => (
                 <Select.Option key={item.code} value={item.code}>
                   {item.name}
                 </Select.Option>
               ))}
             </Select>
           </Form.Item>

           <Form.Item
             label="TopK"
             name="topK"
             rules={[{ required: true, message: '请设置TopK值' }]}
           >
             <Slider
               min={1}
               max={20}
               marks={{
                 1: '1',
                 5: '5',
                 10: '10',
                 15: '15',
                 20: '20'
               }}
               tooltip={{ formatter: (value) => `${value}` }}
             />
           </Form.Item>

           <Form.Item
             label="启用Rerank"
             name="rerankEnabled"
             valuePropName="checked"
             rules={[{ required: true, message: '请选择是否启用Rerank' }]}
           >
             <Switch />
           </Form.Item>

           <Form.Item
             label="标签"
             name="tags"
           >
             <Select
               mode="tags"
               placeholder="请选择已有标签或输入新标签"
               tokenSeparators={[',', ' ']}
               maxTagCount={5}
               options={availableTags.map(tag => ({
                 label: tag.name,
                 value: JSON.stringify({ id: tag.id, name: tag.name })
               }))}
               filterOption={(input, option) =>
                 option?.label?.toLowerCase().includes(input.toLowerCase()) ?? false
               }
             />
           </Form.Item>

           <Form.Item
             label="描述"
             name="description"
             rules={[
               { max: 200, message: '描述不能超过200个字符' }
             ]}
           >
             <Input.TextArea 
               placeholder="请输入知识库描述（可选）" 
               rows={3}
               showCount
               maxLength={200}
             />
           </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default KnowledgeBasePage;
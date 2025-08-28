"use client";

import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Tag, Space, Dropdown, Modal, message, Spin, Form, Select, Slider, Switch } from 'antd';
import { PlusOutlined, MoreOutlined, FileTextOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { getKnowledgeBasePage, deleteKnowledgeBase, createKnowledgeBase, getDictItems, getKnowledgeBaseTags, type KnowledgeBase, type CreateKnowledgeBaseParams, type DictItem, type TagItem } from '@/lib/api';

const { Search } = Input;

const KnowledgeBasePage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchValue, setSearchValue] = useState('');
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [retrievalModes, setRetrievalModes] = useState<DictItem[]>([]);
  const [splitStrategies, setSplitStrategies] = useState<DictItem[]>([]);
  const [availableTags, setAvailableTags] = useState<TagItem[]>([]);
  const [form] = Form.useForm();

  // 获取知识库数据
  const fetchKnowledgeBases = async (isLoadMore = false) => {
    try {
      setLoading(true);
      
      const currentPageNum = isLoadMore ? currentPage + 1 : 1;
      
      const response = await getKnowledgeBasePage({
        pageNum: currentPageNum,
        pageSize,
        keyword: searchValue || undefined
      });

      
      // 检查是否返回了有效数据
      const hasValidData = response?.records && response.records.length > 0;
      
      let newKnowledgeBases;
      if (isLoadMore) {
        newKnowledgeBases = [...knowledgeBases, ...response.records];
        setKnowledgeBases(newKnowledgeBases);
        // 加载更多时，使用请求的页码更新状态
        setCurrentPage(currentPageNum);
      } else {
        newKnowledgeBases = response.records;
        setKnowledgeBases(newKnowledgeBases);
        // 首次加载时，重置为第1页
        setCurrentPage(1);
      }
      
      // 使用更新后的数据长度来判断是否还有更多数据
      const hasMoreData = hasValidData && newKnowledgeBases.length < response.total && response.total > 0;
      setHasMore(hasMoreData);
    } catch (error) {
      console.error('Failed to fetch knowledge bases:', error);
      message.error('获取知识库失败');
      // 如果是加载更多时出错，不要重置hasMore状态，允许用户重试
      if (!isLoadMore) {
        setHasMore(false);
      }
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
  }, []);
  
  // 搜索变化时重新获取数据
  useEffect(() => {
    fetchKnowledgeBases();
  }, [searchValue]);

  // 加载更多数据
  const loadMore = async () => {
    if (loading || !hasMore) {
      return;
    }
    
    await fetchKnowledgeBases(true);
  };

  // 搜索时重置数据
  const handleSearch = (value: string) => {
    setSearchValue(value);
    setCurrentPage(1);
    setHasMore(true);
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
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* 卡片网格布局 */}
        <div 
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '0 24px 16px 24px',
            minHeight: 400,
            maxHeight: 'calc(100vh - 200px)'
          }}
          onScroll={(e) => {
          const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
          const isNearBottom = scrollHeight - scrollTop <= clientHeight + 100;
          
          if (isNearBottom && hasMore && !loading) {
            loadMore();
          }
        }}

        >
          <Spin spinning={loading}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 16,
              minHeight: 'auto'
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
               style={{ 
                 borderRadius: 16, 
                 minHeight: 220, 
                 position: 'relative',
                 boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                 border: '1px solid #f0f0f0',
                 transition: 'all 0.3s ease'
               }}
               bodyStyle={{ padding: '20px' }}
             >
               {/* 右上角菜单按钮 */}
               <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 1 }}>
                 <Dropdown
                   menu={{ items: getMenuItems(kb) }}
                   trigger={['click']}
                   placement="bottomRight"
                 >
                   <Button 
                     type="text" 
                     icon={<MoreOutlined />} 
                     size="small" 
                     style={{ 
                       color: '#8c8c8c',
                       borderRadius: '6px'
                     }}
                   />
                 </Dropdown>
               </div>

               {/* 标题区域 */}
               <div style={{ marginBottom: 16, paddingRight: 40 }}>
                 <div style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
                   <div style={{
                     width: 32,
                     height: 32,
                     borderRadius: '8px',
                     backgroundColor: '#e6f7ff',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     marginRight: 12
                   }}>
                     <FileTextOutlined style={{ color: '#1890ff', fontSize: 16 }} />
                   </div>
                   <h3 style={{ 
                     margin: 0, 
                     fontSize: 18, 
                     fontWeight: 600,
                     color: '#262626',
                     lineHeight: 1.3
                   }}>
                     {kb.name}
                   </h3>
                 </div>
               </div>
               
               {/* 统计信息区域 */}
               <div style={{ 
                 display: 'flex', 
                 justifyContent: 'space-between',
                 marginBottom: 16,
                 padding: '12px 16px',
                 backgroundColor: '#fafafa',
                 borderRadius: '8px'
               }}>
                 <div style={{ textAlign: 'center' }}>
                   <div style={{ fontSize: 20, fontWeight: 600, color: '#1890ff' }}>{kb.docCount}</div>
                   <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 2 }}>文档数</div>
                 </div>
                 <div style={{ textAlign: 'center' }}>
                   <div style={{ fontSize: 12, color: '#8c8c8c' }}>更新时间</div>
                   <div style={{ fontSize: 12, color: '#595959', marginTop: 2, fontWeight: 500 }}>
                     {new Date(kb.updatedTime).toLocaleDateString()}
                   </div>
                 </div>
               </div>
 
               {/* 标签区域 */}
               {kb.tags.length > 0 && (
                 <div style={{ marginBottom: 16 }}>
                   <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 8 }}>标签</div>
                   <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                     {kb.tags.slice(0, 3).map(tag => (
                       <Tag 
                         key={tag} 
                         style={{ 
                           margin: 0,
                           borderRadius: '12px',
                           fontSize: '11px',
                           padding: '2px 8px',
                           backgroundColor: '#f0f9ff',
                           border: '1px solid #bae7ff',
                           color: '#0958d9'
                         }}
                       >
                         {tag}
                       </Tag>
                     ))}
                     {kb.tags.length > 3 && (
                       <Tag style={{ 
                         margin: 0,
                         borderRadius: '12px',
                         fontSize: '11px',
                         padding: '2px 8px',
                         backgroundColor: '#f5f5f5',
                         border: '1px solid #d9d9d9',
                         color: '#8c8c8c'
                       }}>
                         +{kb.tags.length - 3}
                       </Tag>
                     )}
                   </div>
                 </div>
               )}
 
               {/* 描述区域 */}
               {kb.description && (
                 <div>
                   <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 6 }}>描述</div>
                   <p style={{ 
                     color: '#595959', 
                     fontSize: 13, 
                     margin: 0, 
                     lineHeight: 1.5,
                     overflow: 'hidden',
                     textOverflow: 'ellipsis',
                     whiteSpace: 'nowrap'
                   }}>
                     {kb.description}
                   </p>
                 </div>
               )}
             </Card>
            ))}
            </div>
          </Spin>
        </div>
 
        {/* 加载更多提示 */}
        {hasMore && !loading && knowledgeBases.length > 0 && (
          <div style={{ 
            padding: '16px 0 24px', 
            textAlign: 'center',
            color: '#8c8c8c',
            fontSize: '14px'
          }}>
            滚动到底部加载更多...
          </div>
        )}
        
        {!hasMore && knowledgeBases.length > 0 && (
          <div style={{ 
            padding: '16px 0 24px', 
            textAlign: 'center',
            color: '#8c8c8c',
            fontSize: '14px'
          }}>
            已加载全部数据
          </div>
        )}
      </div>

      {/* 新增知识库模态框 */}
      <Modal
          title={
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              fontSize: '16px',
              fontWeight: 600,
              color: '#262626'
            }}>
              <FileTextOutlined style={{ color: '#1890ff' }} />
              新增知识库
            </div>
          }
          open={createModalVisible}
          onOk={handleCreateSubmit}
          onCancel={handleCreateCancel}
          confirmLoading={createLoading}
          width={680}
          destroyOnHidden
          okText="保存"
          cancelText="关闭"
          styles={{
            body: { 
              padding: '24px 0 8px',
              maxHeight: '70vh',
              overflowY: 'auto'
            }
          }}
        >
        <Form
           form={form}
           layout="horizontal"
           labelCol={{ span: 5 }}
           wrapperCol={{ span: 19 }}
           requiredMark={false}
           style={{ padding: '0 24px' }}
         >
          {/* 基本信息分组 */}
          <div style={{ 
            marginBottom: '24px',
            padding: '16px',
            backgroundColor: '#fafafa',
            borderRadius: '8px',
            border: '1px solid #f0f0f0'
          }}>
            <div style={{ 
              fontSize: '14px', 
              fontWeight: 600, 
              color: '#262626', 
              marginBottom: '16px',
              borderLeft: '3px solid #1890ff',
              paddingLeft: '8px'
            }}>
              基本信息
            </div>
            
            <Form.Item
               label="知识库名称"
               name="name"
               rules={[
                 { required: true, message: '请输入知识库名称' },
                 { max: 50, message: '知识库名称不能超过50个字符' }
               ]}
               style={{ marginBottom: '20px' }}
             >
               <Input 
                 placeholder="请输入知识库名称" 
                 style={{ 
                   borderRadius: '6px',
                   fontSize: '14px'
                 }}
               />
             </Form.Item>

             <Form.Item
               label="标签"
               name="tags"
               style={{ marginBottom: '20px' }}
             >
               <Select
                 mode="tags"
                 placeholder="请选择已有标签或输入新标签"
                 tokenSeparators={[',', ' ']}
                 maxTagCount={5}
                 style={{ borderRadius: '6px' }}
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
             style={{ marginBottom: '0' }}
           >
             <Input.TextArea 
               placeholder="请输入知识库描述（可选）" 
               rows={3}
               showCount
               maxLength={200}
               style={{ 
                 borderRadius: '6px',
                 fontSize: '14px'
               }}
             />
           </Form.Item>
          </div>

          {/* 检索配置分组 */}
          <div style={{ 
            marginBottom: '16px',
            padding: '16px',
            backgroundColor: '#f6ffed',
            borderRadius: '8px',
            border: '1px solid #b7eb8f'
          }}>
            <div style={{ 
              fontSize: '14px', 
              fontWeight: 600, 
              color: '#262626', 
              marginBottom: '16px',
              borderLeft: '3px solid #52c41a',
              paddingLeft: '8px'
            }}>
              检索配置
            </div>

            <Form.Item
             label="检索模式"
             name="retrievalMode"
             rules={[{ required: true, message: '请选择检索模式' }]}
             style={{ marginBottom: '20px' }}
           >
             <Select 
               placeholder="请选择检索模式"
               style={{ borderRadius: '6px' }}
             >
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
             style={{ marginBottom: '20px' }}
           >
             <Select 
               placeholder="请选择分块策略"
               style={{ borderRadius: '6px' }}
             >
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
             style={{ marginBottom: '20px' }}
           >
             <div style={{ padding: '0 8px' }}>
               <Slider
                 min={1}
                 max={20}
                 defaultValue={5}
                 marks={{
                   1: { style: { fontSize: '12px' }, label: '1' },
                   5: { style: { fontSize: '12px' }, label: '5' },
                   10: { style: { fontSize: '12px' }, label: '10' },
                   15: { style: { fontSize: '12px' }, label: '15' },
                   20: { style: { fontSize: '12px' }, label: '20' }
                 }}
                 tooltip={{ formatter: (value) => `TopK: ${value}` }}
                 trackStyle={{ backgroundColor: '#52c41a' }}
                 handleStyle={{ borderColor: '#52c41a' }}
               />
             </div>
           </Form.Item>

           <Form.Item
             label="启用Rerank"
             name="rerankEnabled"
             valuePropName="checked"
             rules={[{ required: true, message: '请选择是否启用Rerank' }]}
             style={{ marginBottom: '0' }}
           >
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
               <Switch size="default" />
               <span style={{ fontSize: '12px', color: '#8c8c8c' }}>
                 开启后将对检索结果进行重新排序
               </span>
             </div>
           </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default KnowledgeBasePage;
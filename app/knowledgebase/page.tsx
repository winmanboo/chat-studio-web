"use client";

import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Tag, Space, Dropdown, Modal, message, Spin, Form, Select, Slider, Switch } from 'antd';
import { PlusOutlined, MoreOutlined, FileTextOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useRouter } from 'next/navigation';
import { getKnowledgeBasePage, deleteKnowledgeBase, createKnowledgeBase, updateKnowledgeBase, getKnowledgeBaseInfo, getDictItems, getKnowledgeBaseTags, type KnowledgeBase, type CreateKnowledgeBaseParams, type DictItem, type TagItem } from '@/lib/api';

const { Search } = Input;

const KnowledgeBasePage: React.FC = () => {
  const router = useRouter();
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
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingKnowledgeBase, setEditingKnowledgeBase] = useState<KnowledgeBase | null>(null);
  const [form] = Form.useForm();

  // 监听 rerankEnabled 字段变化，使用状态确保及时更新
  const [rerankEnabledState, setRerankEnabledState] = useState(false);
  const rerankEnabled = Form.useWatch('rerankEnabled', form);

  // 监听其他滑块字段
  const topKValue = Form.useWatch('topK', form);
  const embedMinScoreValue = Form.useWatch('embedMinScore', form);
  const topNValue = Form.useWatch('topN', form);
  const rerankMinScoreValue = Form.useWatch('rerankMinScore', form);

  // 同步 rerankEnabled 状态
  useEffect(() => {
    if (rerankEnabled !== undefined) {
      setRerankEnabledState(rerankEnabled);
    }
  }, [rerankEnabled]);

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
        newKnowledgeBases = [...knowledgeBases, ...(response.records || [])];
        setKnowledgeBases(newKnowledgeBases);
        // 加载更多时，使用请求的页码更新状态
        setCurrentPage(currentPageNum);
      } else {
        newKnowledgeBases = response.records || [];
        setKnowledgeBases(newKnowledgeBases);
        // 首次加载时，重置为第1页
        setCurrentPage(1);
      }
      
      // 使用更新后的数据长度来判断是否还有更多数据
      const hasMoreData = hasValidData && newKnowledgeBases.length < response.total && response.total > 0;
      setHasMore(hasMoreData);
    } catch (error) {
      console.error('Failed to fetch knowledge bases:', error);
      // 如果是加载更多时出错，不要重置hasMore状态，允许用户重试
      if (!isLoadMore) {
        setHasMore(false);
        setKnowledgeBases([]);
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
      case 'edit':
        handleEditKnowledgeBase(knowledgeBase.id);
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
      key: 'edit',
      label: '修改',
      icon: <EditOutlined />,
      onClick: (e) => {
        e.domEvent.stopPropagation();
        handleMenuClick('edit', knowledgeBase);
      },
    },
    {
      key: 'delete',
      label: '删除',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: (e) => {
        e.domEvent.stopPropagation();
        handleMenuClick('delete', knowledgeBase);
      },
    },
  ];

  // 添加知识库
  const handleAddKnowledgeBase = async () => {
    // 获取字典数据
    await fetchDictData();
    
    setIsEditMode(false);
    setEditingKnowledgeBase(null);
    setCreateModalVisible(true);
    form.resetFields();
    // 设置默认值
    form.setFieldsValue({
      topK: 5,
      embedMinScore: 0.5,
      rerankEnabled: false,
      topN: 5,
      rerankMinScore: 0.35,
      tags: []
    });
    setRerankEnabledState(false);
  };

  // 编辑知识库
  const handleEditKnowledgeBase = async (id: number) => {
    try {
      // 获取字典数据
      await fetchDictData();
      
      // 获取知识库详情
      const knowledgeBaseInfo = await getKnowledgeBaseInfo(id);

      setIsEditMode(true);
      setEditingKnowledgeBase(knowledgeBaseInfo);
      setCreateModalVisible(true);

      // 回显数据到表单
      const tagsForForm = knowledgeBaseInfo.tags?.map(tag => JSON.stringify(tag)) || [];

      // 构建表单数据，处理可能为空的字段
      const formData = {
        name: knowledgeBaseInfo.name,
        description: knowledgeBaseInfo.description || '',
        retrievalMode: knowledgeBaseInfo.retrievalMode,
        splitStrategy: knowledgeBaseInfo.splitStrategy,
        topK: knowledgeBaseInfo.topK || 5,
        embedMinScore: knowledgeBaseInfo.embedMinScore || 0.5,
        rerankEnabled: knowledgeBaseInfo.rerankEnabled || false,
        topN: knowledgeBaseInfo.topN || 5,
        rerankMinScore: knowledgeBaseInfo.rerankMinScore || 0.35,
        tags: tagsForForm
      };

      form.setFieldsValue(formData);
      setRerankEnabledState(knowledgeBaseInfo.rerankEnabled || false);
    } catch (error) {
      console.error('Failed to fetch knowledge base info:', error);
      message.error('获取知识库信息失败');
    }
  };

  // 提交新增/编辑知识库
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
        embedMinScore: values.embedMinScore,
        topN: values.rerankEnabled ? values.topN : undefined,
        rerankMinScore: values.rerankEnabled ? values.rerankMinScore : undefined,
        tags: processedTags
      };
      
      if (isEditMode && editingKnowledgeBase) {
        await updateKnowledgeBase(editingKnowledgeBase.id, params);
        message.success('知识库更新成功');
      } else {
        await createKnowledgeBase(params);
        message.success('知识库创建成功');
      }
      
      setCreateModalVisible(false);
      form.resetFields();
      setIsEditMode(false);
      setEditingKnowledgeBase(null);
      setRerankEnabledState(false);
      fetchKnowledgeBases(); // 刷新列表
    } catch (error) {
      console.error('Failed to save knowledge base:', error);
      message.error(isEditMode ? '更新知识库失败' : '创建知识库失败');
    } finally {
      setCreateLoading(false);
    }
  };

  // 取消新增
  const handleCreateCancel = () => {
    setCreateModalVisible(false);
    form.resetFields();
    setRerankEnabledState(false);
  };

  return (
    <div style={{ height: '100vh', width: '100%', background: '#fff', color: '#222', display: 'flex', flexDirection: 'column' }}>
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
      <div 
        style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '0 24px 16px 24px'
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
            paddingBottom: 16
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
           {knowledgeBases?.map((kb) => (
             <Card
               key={kb.id}
               hoverable
               style={{ 
                 borderRadius: 16, 
                 minHeight: 220, 
                 position: 'relative',
                 boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                 border: '1px solid #f0f0f0',
                 transition: 'all 0.3s ease',
                 cursor: 'pointer'
               }}
               bodyStyle={{ padding: '20px' }}
               onClick={() => router.push(`/documents?kbId=${kb.id}`)}
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
                     onClick={(e) => e.stopPropagation()}
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
               <div style={{ marginBottom: 16, minHeight: 32 }}>
                 <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 8 }}>标签</div>
                 <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', minHeight: 24 }}>
                   {kb.tags && kb.tags.length > 0 ? (
                     <>
                       {kb.tags.slice(0, 3).map(tag => (
                         <Tag 
                           key={tag.id} 
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
                           {tag.name}
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
                     </>
                   ) : (
                     <span style={{ 
                       fontSize: '11px',
                       color: '#bfbfbf',
                       fontStyle: 'italic',
                       lineHeight: '24px'
                     }}>
                       暂无标签
                     </span>
                   )}
                 </div>
               </div>
 
               {/* 描述区域 */}
               <div style={{ minHeight: 40 }}>
                 <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 6 }}>描述</div>
                 <p style={{ 
                   color: kb.description ? '#595959' : '#bfbfbf', 
                   fontSize: 13, 
                   margin: 0, 
                   lineHeight: 1.5,
                   overflow: 'hidden',
                   textOverflow: 'ellipsis',
                   whiteSpace: 'nowrap',
                   fontStyle: kb.description ? 'normal' : 'italic'
                 }}>
                   {kb.description || '暂无描述信息'}
                 </p>
               </div>
             </Card>
            ))}
          </div>
        </Spin>
        
        {/* 空状态占位符 */}
        {!loading && knowledgeBases?.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#8c8c8c'
          }}>
            <FileTextOutlined style={{ fontSize: 64, color: '#d9d9d9', marginBottom: 16 }} />
            <div style={{ fontSize: 16, marginBottom: 8, color: '#595959' }}>暂无知识库</div>
            <div style={{ fontSize: 14 }}>
              {searchValue ? '没有找到相关的知识库，请尝试其他关键词' : '还没有创建任何知识库，点击上方按钮开始创建'}
            </div>
          </div>
        )}
        
        {/* 加载更多提示 */}
        {hasMore && !loading && knowledgeBases?.length > 0 && (
          <div style={{ 
            padding: '16px 0 24px', 
            textAlign: 'center',
            color: '#8c8c8c',
            fontSize: '14px'
          }}>
            滚动到底部加载更多...
          </div>
        )}
        
        {!hasMore && knowledgeBases?.length > 0 && (
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
              {isEditMode ? (
                <EditOutlined style={{ color: '#1890ff' }} />
              ) : (
                <FileTextOutlined style={{ color: '#1890ff' }} />
              )}
              {isEditMode ? '编辑知识库' : '新增知识库'}
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
                 max={10}
                 defaultValue={5}
                 value={topKValue}
                 marks={{
                   1: { style: { fontSize: '12px' }, label: '1' },
                   5: { style: { fontSize: '12px' }, label: '5' },
                   10: { style: { fontSize: '12px' }, label: '10' },
                   15: { style: { fontSize: '12px' }, label: '15' },
                   20: { style: { fontSize: '12px' }, label: '20' }
                 }}
                 tooltip={{ formatter: (value) => `TopK: ${value}` }}
                 styles={{ track: { backgroundColor: '#52c41a' }, handle: { borderColor: '#52c41a' } }}
                 onChange={(value) => form.setFieldValue('topK', value)}
               />
             </div>
           </Form.Item>

           <Form.Item
             label="向量召回阈值"
             name="embedMinScore"
             rules={[{ required: true, message: '请设置向量召回阈值' }]}
             style={{ marginBottom: '20px' }}
           >
             <div style={{ padding: '0 8px' }}>
               <Slider
                 min={0.5}
                 max={0.95}
                 step={0.01}
                 defaultValue={0.5}
                 value={embedMinScoreValue}
                 marks={{
                   0.5: { style: { fontSize: '12px' }, label: '0.5' },
                   0.7: { style: { fontSize: '12px' }, label: '0.7' },
                   0.9: { style: { fontSize: '12px' }, label: '0.9' },
                   0.95: { style: { fontSize: '12px' }, label: '0.95' }
                 }}
                 tooltip={{ formatter: (value) => `向量召回阈值: ${value}` }}
                 styles={{ track: { backgroundColor: '#1890ff' }, handle: { borderColor: '#1890ff' } }}
                 onChange={(value) => form.setFieldValue('embedMinScore', value)}
               />
             </div>
           </Form.Item>

           <Form.Item
             label="启用Rerank"
             name="rerankEnabled"
             valuePropName="checked"
             rules={[{ required: true, message: '请选择是否启用Rerank' }]}
             style={{ marginBottom: rerankEnabledState ? '20px' : '0' }}
           >
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
               <Switch
                 size="default"
                 checked={rerankEnabled}
                 onChange={(checked) => {
                   form.setFieldValue('rerankEnabled', checked);
                   setRerankEnabledState(checked);
                 }}
               />
               <span style={{ fontSize: '12px', color: '#8c8c8c' }}>
                 开启后将对检索结果进行重新排序
               </span>
             </div>
           </Form.Item>

           {rerankEnabledState && (
             <>
               <Form.Item
                 label="Rerank数量"
                 name="topN"
                 rules={[{ required: true, message: '请设置Rerank数量' }]}
                 style={{ marginBottom: '20px' }}
               >
                 <div style={{ padding: '0 8px' }}>
                   <Slider
                     min={1}
                     max={10}
                     defaultValue={5}
                     value={topNValue}
                     marks={{
                       1: { style: { fontSize: '12px' }, label: '1' },
                       5: { style: { fontSize: '12px' }, label: '5' },
                       10: { style: { fontSize: '12px' }, label: '10' },
                       15: { style: { fontSize: '12px' }, label: '15' },
                       20: { style: { fontSize: '12px' }, label: '20' }
                     }}
                     tooltip={{ formatter: (value) => `Rerank数量: ${value}` }}
                     styles={{ track: { backgroundColor: '#fa8c16' }, handle: { borderColor: '#fa8c16' } }}
                     onChange={(value) => form.setFieldValue('topN', value)}
                   />
                 </div>
               </Form.Item>

               <Form.Item
                 label="Rerank召回阈值"
                 name="rerankMinScore"
                 style={{ marginBottom: '0' }}
               >
                 <div style={{ padding: '0 8px' }}>
                   <Slider
                     min={0.35}
                     max={0.95}
                     step={0.01}
                     defaultValue={0.35}
                     value={rerankMinScoreValue}
                     marks={{
                       0.35: { style: { fontSize: '12px' }, label: '0.35' },
                       0.6: { style: { fontSize: '12px' }, label: '0.6' },
                       0.8: { style: { fontSize: '12px' }, label: '0.8' },
                       0.95: { style: { fontSize: '12px' }, label: '0.95' }
                     }}
                     tooltip={{ formatter: (value) => `Rerank召回阈值: ${value}` }}
                     styles={{ track: { backgroundColor: '#fa8c16' }, handle: { borderColor: '#fa8c16' } }}
                     onChange={(value) => form.setFieldValue('rerankMinScore', value)}
                   />
                 </div>
               </Form.Item>
             </>
           )}
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default KnowledgeBasePage;
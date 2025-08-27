"use client";

import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Tag, Space, Dropdown, Pagination, Modal, message, Spin } from 'antd';
import { PlusOutlined, MoreOutlined, FileTextOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { getKnowledgeBasePage, deleteKnowledgeBase, type KnowledgeBase } from '@/lib/api';

const { Search } = Input;

const KnowledgeBasePage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchValue, setSearchValue] = useState('');
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

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

  // 页面加载时获取数据
  useEffect(() => {
    fetchKnowledgeBases();
  }, [currentPage, pageSize]);

  // 搜索时重置到第一页并获取数据
  const handleSearch = (value: string) => {
    setSearchValue(value);
    setCurrentPage(1);
  };

  useEffect(() => {
    if (currentPage === 1) {
      fetchKnowledgeBases();
    } else {
      setCurrentPage(1);
    }
  }, [searchValue]);

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
  const handleAddKnowledgeBase = () => {
    message.info('添加知识库功能开发中...');
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
    </div>
  );
};

export default KnowledgeBasePage;
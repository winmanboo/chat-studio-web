"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { Table, Button, Input, Tag, Space, Modal, message, Tooltip } from 'antd';
import { UploadOutlined, DeleteOutlined, EyeOutlined, FileTextOutlined, ExclamationCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { useSearchParams, useRouter } from 'next/navigation';
import { getDocumentPage, deleteDocument, type Document } from '@/lib/api';
import DocumentUploadModal from '@/components/DocumentUploadModal';
import DocumentDetailModal from '@/components/DocumentDetailModal';

const { Search } = Input;

const DocumentsPageContent: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const kbId = searchParams.get('kbId');
  
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [searchValue, setSearchValue] = useState('');
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  // 获取文档数据
  const fetchDocuments = async (pageNum = 1, keyword = '') => {
    if (!kbId) {
      message.error('缺少知识库ID参数');
      return;
    }

    try {
      setLoading(true);
      const response = await getDocumentPage({
        kbId,
        pageNum,
        pageSize,
        keyword: keyword || undefined
      });

      // 正常处理响应数据，包括空数据情况
      setDocuments(response?.records || []);
      setTotal(response?.total || 0);
      setCurrentPage(response?.current || pageNum);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      // 只在真正的网络错误或服务器错误时显示错误消息
      // 数据为空不算错误，不显示错误提示
      setDocuments([]);
      setTotal(0);
      setCurrentPage(pageNum);
    } finally {
      setLoading(false);
    }
  };

  // 页面加载时获取数据
  useEffect(() => {
    fetchDocuments(1, searchValue);
  }, [kbId]);

  // 搜索处理
  const handleSearch = (value: string) => {
    setSearchValue(value);
    fetchDocuments(1, value);
  };

  // 分页处理
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchDocuments(page, searchValue);
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 格式化时间
  const formatTime = (timeStr: string) => {
    return new Date(timeStr).toLocaleString('zh-CN');
  };

  // 获取状态标签
  const getStatusTag = (status: string, error?: string | null) => {
    const statusConfig = {
      QUEUE: { color: 'blue', text: '队列中' },
      PROCESSING: { color: 'orange', text: '处理中' },
      COMPLETED: { color: 'green', text: '已完成' },
      FAILED: { color: 'red', text: '失败' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { color: 'default', text: status };
    
    if (status === 'FAILED' && error) {
      return (
        <Tooltip title={error}>
          <Tag color={config.color} style={{ cursor: 'pointer' }}>
            {config.text}
          </Tag>
        </Tooltip>
      );
    }

    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 删除文档
  const handleDelete = (doc: Document) => {
    Modal.confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除文档 "${doc.title}" 吗？此操作不可撤销。`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteDocument(doc.id);
          message.success('文档删除成功');
          fetchDocuments(currentPage, searchValue);
        } catch (error) {
          message.error(error instanceof Error ? error.message : '删除失败');
        }
      },
    });
  };

  // 返回知识库
  const handleBack = () => {
    router.push('/knowledgebase');
  };

  // 处理查看详情
  const handleViewDetail = (record: Document) => {
    setSelectedDocId(record.id.toString());
    setDetailModalVisible(true);
  };

  if (!kbId) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <p>缺少知识库ID参数</p>
        <Button onClick={handleBack}>返回知识库</Button>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', width: '100%', background: '#fff', color: '#222', display: 'flex', flexDirection: 'column' }}>
      {/* 头部 */}
      <div style={{ padding: 24, flexShrink: 0, borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <Button type="text" onClick={handleBack} style={{ marginRight: 8 }}>
            ← 返回知识库
          </Button>
          <h2 style={{ margin: 0, color: '#222' }}>文档管理</h2>
        </div>
        <Space style={{ marginBottom: 16 }}>
          <Search
            placeholder="搜索文档"
            allowClear
            style={{ width: 300 }}
            onSearch={handleSearch}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          <Button 
            icon={<ReloadOutlined />}
            onClick={() => fetchDocuments(currentPage, searchValue)}
          >
            刷新
          </Button>
          <Button 
            type="primary" 
            icon={<UploadOutlined />}
            onClick={() => setUploadModalVisible(true)}
          >
            上传文档
          </Button>
        </Space>
      </div>

      {/* 文档列表 */}
      <div 
        style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '0 24px 16px 24px'
        }}
      >
        <Table
          dataSource={documents}
          loading={loading}
          rowKey="id"
          scroll={{ y: 'calc(100vh - 320px)' }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            onChange: handlePageChange,
            showSizeChanger: false,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
            style: { marginTop: 16 },
            hideOnSinglePage: false
          }}
          locale={{
            emptyText: (
              <div style={{ 
                textAlign: 'center', 
                padding: '60px 0',
                color: '#8c8c8c'
              }}>
                <FileTextOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                <div style={{ fontSize: 16, marginBottom: 8 }}>暂无文档</div>
                <div style={{ fontSize: 14 }}>点击上传按钮添加文档</div>
              </div>
            )
          }}
          columns={[
            {
              title: '文档名称',
              dataIndex: 'title',
              key: 'title',
              width: 200,
              render: (title: string, record: Document) => (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <FileTextOutlined style={{ fontSize: 16, color: '#1890ff', marginRight: 8 }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{title}</div>
                    <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                      {record.sourceType.toUpperCase()}
                    </div>
                  </div>
                </div>
              )
            },
            {
               title: '处理状态',
               dataIndex: 'status',
               key: 'status',
               width: 100,
               render: (status: string, record: Document) => (
                 getStatusTag(status, record.error)
               )
             },
             {
               title: '标签',
               dataIndex: 'tags',
               key: 'tags',
               width: 200,
               render: (tags: string[]) => (
                 <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                   {tags.length > 0 ? (
                     tags.map((tag, index) => (
                        <Tag key={index}>{tag}</Tag>
                      ))
                   ) : (
                     <span style={{ color: '#8c8c8c', fontSize: 12 }}>无标签</span>
                   )}
                 </div>
               )
             },
             {
               title: '分块数',
               dataIndex: 'chunkSize',
               key: 'chunkSize',
               width: 80,
               align: 'center'
             },
             {
               title: 'Token用量',
               dataIndex: 'totalTokenCount',
               key: 'totalTokenCount',
               width: 100,
               align: 'center',
               render: (totalTokenCount: number | null) => (
                 totalTokenCount !== null ? totalTokenCount.toLocaleString() : '-'
               )
             },
             {
               title: '文件大小',
               dataIndex: 'size',
               key: 'size',
               width: 100,
               render: (size: number) => formatFileSize(size)
             },
             {
               title: '上传时间',
               dataIndex: 'uploadTime',
               key: 'uploadTime',
               width: 160,
               render: (time: string) => formatTime(time)
            },
            
             {
               title: '操作',
               key: 'action',
               width: 120,
               render: (_, record: Document) => (
                 <Space>
                   {record.status === 'COMPLETED' && (
                     <Button 
                       type="text" 
                       icon={<EyeOutlined />} 
                       size="small"
                       onClick={() => handleViewDetail(record)}
                     >
                       详情
                     </Button>
                   )}
                   <Button 
                     type="text" 
                     icon={<DeleteOutlined />} 
                     size="small"
                     danger
                     onClick={() => handleDelete(record)}
                   >
                     删除
                   </Button>
                 </Space>
               )
             }
          ]}
        />
      </div>

      {/* 上传文档模态框 */}
      <DocumentUploadModal
        visible={uploadModalVisible}
        onCancel={() => setUploadModalVisible(false)}
        onSuccess={() => {
          setUploadModalVisible(false);
          fetchDocuments(currentPage, searchValue);
        }}
        kbId={kbId || ''}
      />

      {/* 文档详情模态框 */}
      <DocumentDetailModal
        visible={detailModalVisible}
        onClose={() => {
          setDetailModalVisible(false);
          setSelectedDocId(null);
        }}
        docId={selectedDocId}
      />
    </div>
  );
};

const DocumentsPage: React.FC = () => {
  return (
    <Suspense fallback={
      <div style={{ 
        height: '100vh', 
        width: '100%', 
        background: '#fff', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontSize: 16,
        color: '#666'
      }}>
        加载中...
      </div>
    }>
      <DocumentsPageContent />
    </Suspense>
  );
};

export default DocumentsPage;
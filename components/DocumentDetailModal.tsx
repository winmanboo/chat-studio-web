import React, { useState, useEffect } from 'react';
import { Modal, Descriptions, Tag, Spin, message, Table, theme, Typography, Space } from 'antd';
import { DocumentDetail, getDocumentInfo, DocumentChunk, getDocumentChunkPage } from '@/lib/api/documents';
import { FileTextOutlined, AppstoreOutlined, InfoCircleOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

interface DocumentDetailModalProps {
  visible: boolean;
  onClose: () => void;
  docId: string | null;
}

const DocumentDetailModal: React.FC<DocumentDetailModalProps> = ({
  visible,
  onClose,
  docId
}) => {
  const { token } = theme.useToken();
  const [loading, setLoading] = useState(false);
  const [documentDetail, setDocumentDetail] = useState<DocumentDetail | null>(null);
  const [chunkLoading, setChunkLoading] = useState(false);
  const [chunks, setChunks] = useState<DocumentChunk[]>([]);
  const [chunkPagination, setChunkPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  useEffect(() => {
    if (visible && docId) {
      fetchDocumentDetail();
    }
  }, [visible, docId]);

  const fetchDocumentDetail = async () => {
    if (!docId) return;
    
    setLoading(true);
    try {
      const detail = await getDocumentInfo(docId);
      setDocumentDetail(detail);
      // 使用文档详情接口返回的docId来获取分块数据
      fetchDocumentChunks(detail.docId, 1, 10);
    } catch (error) {
      message.error('获取文档详情失败');
      console.error('获取文档详情失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocumentChunks = async (targetDocId: string, pageNum: number, pageSize: number) => {
    if (!targetDocId) return;
    
    setChunkLoading(true);
    try {
      const response = await getDocumentChunkPage({
        docId: targetDocId,
        pageNum,
        pageSize
      });
      setChunks(response.records);
      setChunkPagination({
        current: response.current,
        pageSize: response.size,
        total: response.total
      });
    } catch (error) {
      message.error('获取文档分块失败');
      console.error('获取文档分块失败:', error);
    } finally {
      setChunkLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  const handleChunkPageChange = (page: number, pageSize?: number) => {
    if (documentDetail?.docId) {
      fetchDocumentChunks(documentDetail.docId, page, pageSize || chunkPagination.pageSize);
    }
  };

  const chunkColumns = [
    {
      title: '序号',
      dataIndex: 'chunkIndex',
      key: 'chunkIndex',
      width: 80,
      align: 'center' as const,
      render: (index: number) => index + 1
    },
    {
      title: '分块内容',
      dataIndex: 'content',
      key: 'content',
      render: (content: string) => (
        <div style={{ 
          maxHeight: '120px', 
          overflowY: 'auto',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
          background: token.colorFillQuaternary,
          padding: '8px 12px',
          borderRadius: token.borderRadius,
          fontSize: 13,
          color: token.colorText
        }}>
          {content}
        </div>
      )
    }
  ];

  return (
    <Modal
      title={
        <Space>
          <FileTextOutlined style={{ color: token.colorPrimary }} />
          <span style={{ fontSize: 16, fontWeight: 600 }}>文档详情</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={900}
      destroyOnHidden
      styles={{
        body: { padding: '20px 24px' }
      }}
    >
      <Spin spinning={loading}>
        {documentDetail && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* 基本信息 */}
            <div>
              <Title level={5} style={{ fontSize: 14, marginBottom: 16 }}>
                <Space>
                  <InfoCircleOutlined />
                  基本信息
                </Space>
              </Title>
              <Descriptions 
                column={{ xxl: 3, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }} 
                bordered 
                size="small"
                styles={{ label: { width: '120px', background: token.colorFillQuaternary } }}
              >
                <Descriptions.Item label="文档ID" span={2}>
                  <Text copyable>{documentDetail.docId}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="来源类型">
                  <Tag color="blue">{documentDetail.sourceType}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="文档标题" span={3}>
                  {documentDetail.title}
                </Descriptions.Item>
                <Descriptions.Item label="分块数量">
                  {documentDetail.chunkSize}
                </Descriptions.Item>
                <Descriptions.Item label="输入Token">
                  {documentDetail.inputTokenCount?.toLocaleString() || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="输出Token">
                  {documentDetail.outputTokenCount?.toLocaleString() || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="总Token数" span={3}>
                  {documentDetail.totalTokenCount?.toLocaleString() || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="标签" span={3}>
                  {documentDetail.tags && documentDetail.tags.length > 0 ? (
                    <Space size={4} wrap>
                      {documentDetail.tags.map((tag, index) => (
                        <Tag key={index} bordered={false} style={{ background: token.colorFillSecondary }}>{tag}</Tag>
                      ))}
                    </Space>
                  ) : (
                    <Text type="secondary">-</Text>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="描述" span={3}>
                  {documentDetail.description || <Text type="secondary">暂无描述</Text>}
                </Descriptions.Item>
              </Descriptions>
            </div>

            {/* 文件信息 */}
            {documentDetail.fileUploads && (
              <div>
                 <Title level={5} style={{ fontSize: 14, marginBottom: 16 }}>
                  <Space>
                    <FileTextOutlined />
                    文件信息
                  </Space>
                </Title>
                <Descriptions 
                  column={{ xxl: 3, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }} 
                  bordered 
                  size="small"
                  styles={{ label: { width: '120px', background: token.colorFillQuaternary } }}
                >
                  <Descriptions.Item label="原始文件名" span={2}>
                    {documentDetail.fileUploads.originalName}
                  </Descriptions.Item>
                  <Descriptions.Item label="存储类型">
                    <Tag color="orange">{documentDetail.fileUploads.storageType}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="文件大小">
                    {formatFileSize(documentDetail.fileUploads.size)}
                  </Descriptions.Item>
                  <Descriptions.Item label="文件类型">
                    <Tag color="purple">{documentDetail.fileUploads.contentType}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="上传时间">
                    {formatDate(documentDetail.fileUploads.createdTime)}
                  </Descriptions.Item>
                  <Descriptions.Item label="存储路径" span={3}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {documentDetail.fileUploads.storagePath}
                    </Text>
                  </Descriptions.Item>
                </Descriptions>
              </div>
            )}

            {/* 分块列表 */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Title level={5} style={{ fontSize: 14, margin: 0 }}>
                  <Space>
                    <AppstoreOutlined />
                    分块预览
                  </Space>
                </Title>
                <Tag color="processing">共 {chunkPagination.total} 个分块</Tag>
              </div>
              <Table
                columns={chunkColumns}
                dataSource={chunks}
                rowKey="chunkId"
                loading={chunkLoading}
                size="small"
                bordered
                pagination={{
                  current: chunkPagination.current,
                  pageSize: chunkPagination.pageSize,
                  total: chunkPagination.total,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
                  onChange: handleChunkPageChange,
                  onShowSizeChange: handleChunkPageChange
                }}
              />
            </div>
          </div>
        )}
      </Spin>
    </Modal>
  );
};

export default DocumentDetailModal;

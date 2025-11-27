import React, { useState, useEffect } from 'react';
import { Modal, Descriptions, Tag, Spin, message, Table, Card } from 'antd';
import { DocumentDetail, getDocumentInfo, DocumentChunk, getDocumentChunkPage } from '@/lib/api/documents';

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
      title: '分块序号',
      dataIndex: 'chunkIndex',
      key: 'chunkIndex',
      width: 100,
      render: (index: number) => index + 1
    },
    {
      title: '分块内容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      render: (content: string) => (
        <div style={{ maxHeight: '100px', overflow: 'auto' }}>
          {content}
        </div>
      )
    }
  ];

  return (
    <Modal
      title="文档详情"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={1000}
      destroyOnClose
    >
      <Spin spinning={loading}>
        {documentDetail && (
          <>
            <Descriptions column={2} bordered style={{ marginBottom: 24 }}>
              <Descriptions.Item label="文档ID" span={2}>
                {documentDetail.docId}
              </Descriptions.Item>
              
              <Descriptions.Item label="文档标题" span={2}>
                {documentDetail.title}
              </Descriptions.Item>
              
              <Descriptions.Item label="文件来源">
                <Tag color="blue">{documentDetail.sourceType}</Tag>
              </Descriptions.Item>
              
              <Descriptions.Item label="分块数量">
                {documentDetail.chunkSize}
              </Descriptions.Item>
              
              <Descriptions.Item label="输入Token">
                {documentDetail.inputTokenCount || '-'}
              </Descriptions.Item>
              
              <Descriptions.Item label="输出Token">
                {documentDetail.outputTokenCount || '-'}
              </Descriptions.Item>
              
              <Descriptions.Item label="总Token数">
                {documentDetail.totalTokenCount || '-'}
              </Descriptions.Item>
              
              <Descriptions.Item label="标签">
                {documentDetail.tags && documentDetail.tags.length > 0 ? (
                  documentDetail.tags.map((tag, index) => (
                    <Tag key={index} color="green">{tag}</Tag>
                  ))
                ) : (
                  '-'
                )}
              </Descriptions.Item>
              
              <Descriptions.Item label="描述" span={2}>
                {documentDetail.description || '-'}
              </Descriptions.Item>
              
              {documentDetail.fileUploads && (
                <>
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
                  
                  <Descriptions.Item label="存储路径" span={2}>
                    <code style={{ fontSize: '12px', wordBreak: 'break-all' }}>
                      {documentDetail.fileUploads.storagePath}
                    </code>
                  </Descriptions.Item>
                </>
              )}
            </Descriptions>

            <Card title="文档分块列表" style={{ marginTop: 16 }}>
              <Table
                columns={chunkColumns}
                dataSource={chunks}
                rowKey="chunkId"
                loading={chunkLoading}
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
            </Card>
          </>
        )}
      </Spin>
    </Modal>
  );
};

export default DocumentDetailModal;
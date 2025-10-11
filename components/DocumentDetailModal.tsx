import React, { useState, useEffect } from 'react';
import { Modal, Descriptions, Tag, Spin, message } from 'antd';
import { DocumentDetail, getDocumentInfo } from '@/lib/api/documents';

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
    } catch (error) {
      message.error('获取文档详情失败');
      console.error('获取文档详情失败:', error);
    } finally {
      setLoading(false);
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

  return (
    <Modal
      title="文档详情"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      destroyOnClose
    >
      <Spin spinning={loading}>
        {documentDetail && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="文档ID" span={2}>
              {documentDetail.docId}
            </Descriptions.Item>
            
            <Descriptions.Item label="文档标题" span={2}>
              {documentDetail.title}
            </Descriptions.Item>
            
            <Descriptions.Item label="来源类型">
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
        )}
      </Spin>
    </Modal>
  );
};

export default DocumentDetailModal;
import React, { useState, useEffect } from 'react';
import { Modal, Descriptions, Tag, Spin, message, theme, Typography, Space, Tooltip } from 'antd';
import { DocumentDetail, getDocumentInfo } from '@/lib/api/documents';
import { FileTextOutlined, InfoCircleOutlined } from '@ant-design/icons';
import styles from './DocumentDetailModal.module.css';

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
      title={
        <Space>
          <FileTextOutlined style={{ color: token.colorPrimary }} />
          <span className={styles.modalTitle}>文档详情</span>
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
          <div className={styles.container}>
            {/* 基本信息 */}
            <div>
              <Title level={5} className={styles.sectionTitle}>
                <Space>
                  <InfoCircleOutlined />
                  基本信息
                </Space>
              </Title>
              <Descriptions 
                column={{ xxl: 3, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }} 
                bordered 
                size="small"
                styles={{ label: { width: '120px', background: 'var(--fill-quaternary)' } }}
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
                        <Tag key={index} bordered={false} style={{ background: 'var(--fill-secondary)' }}>{tag}</Tag>
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
                 <Title level={5} className={styles.sectionTitle}>
                  <Space>
                    <FileTextOutlined />
                    文件信息
                  </Space>
                </Title>
                <Descriptions 
                  column={{ xxl: 3, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }} 
                  bordered 
                  size="small"
                  styles={{ label: { width: '120px', background: 'var(--fill-quaternary)' } }}
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
                    <Tooltip title={documentDetail.fileUploads.contentType}>
                      <Tag color="purple" className={styles.tagWrapper}>
                        <span className={styles.truncatedText}>
                          {documentDetail.fileUploads.contentType}
                        </span>
                      </Tag>
                    </Tooltip>
                  </Descriptions.Item>
                  <Descriptions.Item label="上传时间">
                    {formatDate(documentDetail.fileUploads.createdTime)}
                  </Descriptions.Item>
                  <Descriptions.Item label="存储路径" span={3}>
                    <Text type="secondary" className={styles.secondaryText}>
                      {documentDetail.fileUploads.storagePath}
                    </Text>
                  </Descriptions.Item>
                </Descriptions>
              </div>
            )}


          </div>
        )}
      </Spin>
    </Modal>
  );
};

export default DocumentDetailModal;

import React from 'react';
import { Card, Tag, Typography, Space } from 'antd';
import { DatabaseOutlined, FileTextOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface RetrieveResult {
  chunkIndexs: string[];
  docId: string;
  kbId: number;
  title: string;
}

interface RetrieveResultsDisplayProps {
  kbName: string;
  retrieves: RetrieveResult[];
}

const RetrieveResultsDisplay: React.FC<RetrieveResultsDisplayProps> = ({
  kbName,
  retrieves
}) => {
  return (
    <Card
      size="small"
      style={{
        marginBottom: '12px',
        backgroundColor: '#f8f9fa',
        border: '1px solid #e9ecef'
      }}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="small">
        {/* 知识库信息 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <DatabaseOutlined style={{ color: '#1890ff', fontSize: '14px' }} />
          <Text strong style={{ fontSize: '13px' }}>
            在知识库「{kbName}」中找到 {retrieves.length} 个相关文件
          </Text>
        </div>
        
        {/* 文档列表 */}
        <div style={{ paddingLeft: '22px' }}>
          {retrieves.map((retrieve, index) => (
            <div
              key={`${retrieve.docId}-${index}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: index < retrieves.length - 1 ? '6px' : '0',
                padding: '4px 8px',
                backgroundColor: '#fff',
                borderRadius: '4px',
                border: '1px solid #f0f0f0'
              }}
            >
              <FileTextOutlined style={{ color: '#52c41a', fontSize: '12px' }} />
              <Text style={{ fontSize: '12px', flex: 1 }}>
                {retrieve.title}
              </Text>
              {retrieve.chunkIndexs && retrieve.chunkIndexs.length > 0 && (
                <Tag
                  style={{
                    fontSize: '10px',
                    padding: '0 4px',
                    height: '18px',
                    lineHeight: '16px',
                    backgroundColor: '#e6f7ff',
                    border: '1px solid #91d5ff',
                    color: '#1890ff'
                  }}
                >
                  {retrieve.chunkIndexs.length} 段落
                </Tag>
              )}
            </div>
          ))}
        </div>
      </Space>
    </Card>
  );
};

export default RetrieveResultsDisplay;
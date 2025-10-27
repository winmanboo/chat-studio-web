import React from 'react';
import { Tag, Space, Typography } from 'antd';
import { ToolOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface ToolRendererProps {
  toolNames: string[];
  className?: string;
}

const ToolRenderer: React.FC<ToolRendererProps> = ({ 
  toolNames, 
  className 
}) => {
  if (!toolNames || toolNames.length === 0) {
    return null;
  }

  return (
    <div 
      className={className}
      style={{
        marginTop: '8px',
        marginBottom: '8px',
        padding: '8px 12px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #e9ecef',
      }}
    >
      <Space direction="vertical" size={4} style={{ width: '100%' }}>
        <Space align="center" size={4}>
          <ToolOutlined style={{ color: '#6c757d', fontSize: '12px' }} />
          <Text 
            style={{ 
              fontSize: '12px', 
              color: '#6c757d',
              fontWeight: 500
            }}
          >
            工具调用
          </Text>
        </Space>
        <Space wrap size={[4, 4]}>
          {toolNames.map((toolName, index) => (
            <Tag
              key={index}
              color="blue"
              style={{
                fontSize: '11px',
                padding: '2px 6px',
                borderRadius: '4px',
                margin: 0,
              }}
            >
              {toolName}
            </Tag>
          ))}
        </Space>
      </Space>
    </div>
  );
};

export default ToolRenderer;
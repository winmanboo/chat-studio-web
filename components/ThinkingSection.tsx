import React, { useState, useEffect } from 'react';
import { Collapse } from 'antd';
import { BulbOutlined } from '@ant-design/icons';
import { renderMarkdown } from '@/components/MarkdownRenderer';

const { Panel } = Collapse;

interface ThinkingSectionProps {
  content: string;
  defaultExpanded?: boolean;
  duration?: number; // 耗时时长，单位为秒
}

const ThinkingSection: React.FC<ThinkingSectionProps> = ({
  content,
  defaultExpanded = false, // 默认不展开
  duration,
}) => {
  const [activeKey, setActiveKey] = useState<string[]>(
    defaultExpanded ? ['thinking'] : []
  );

  // 当defaultExpanded改变时，重新设置activeKey
  useEffect(() => {
    setActiveKey(defaultExpanded ? ['thinking'] : []);
  }, [defaultExpanded]);

  if (!content || content.trim() === '') {
    return null;
  }

  const handleChange = (key: string | string[]) => {
    setActiveKey(Array.isArray(key) ? key : [key]);
  };

  return (
    <div style={{ marginBottom: '12px' }}>
      <Collapse
        activeKey={activeKey}
        onChange={handleChange}
        ghost
        size="small"
        style={{
          backgroundColor: 'transparent',
        }}
      >
        <Panel
          header={
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#666',
                  fontSize: '13px',
                  fontWeight: 500,
                }}
              >
                <BulbOutlined style={{ color: '#666' }} />
                深度思考
              </div>
              {duration && (
                <div
                  style={{
                    color: '#999',
                    fontSize: '12px',
                    fontWeight: 400,
                  }}
                >
                  {duration.toFixed(1)}s
                </div>
              )}
            </div>
          }
          key="thinking"
          style={{
            backgroundColor: 'transparent',
            border: 'none',
          }}
        >
          <div
            style={{
              color: '#666',
              fontSize: '13px',
              lineHeight: '1.4',
              padding: '8px 0 8px 16px',
              marginTop: '4px',
              marginLeft: '4px',
              borderLeft: '3px solid #d0d7de',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
            className="thinking-content"
          >
            {renderMarkdown(content)}
          </div>
        </Panel>
      </Collapse>
      
      <style jsx global>{`
        .thinking-content .markdown-content {
          color: #666 !important;
          font-size: 13px !important;
          line-height: 1.4 !important;
          white-space: pre-wrap !important;
          word-break: break-word !important;
        }
        
        .thinking-content .markdown-content h1,
        .thinking-content .markdown-content h2,
        .thinking-content .markdown-content h3,
        .thinking-content .markdown-content h4,
        .thinking-content .markdown-content h5,
        .thinking-content .markdown-content h6 {
          color: #555 !important;
          font-size: 14px !important;
          margin: 0 !important;
        }
        
        .thinking-content .markdown-content p {
          margin: 4px 0 !important;
          padding: 0 !important;
          color: #666 !important;
        }
        
        .thinking-content .markdown-content p:first-child {
          margin-top: 0 !important;
        }
        
        .thinking-content .markdown-content p:last-child {
          margin-bottom: 0 !important;
        }
        
        .thinking-content .markdown-content code {
          background-color: transparent !important;
          color: #666 !important;
          font-size: 12px !important;
        }
        
        .thinking-content .markdown-content pre {
          background-color: transparent !important;
          border: none !important;
        }
        
        .thinking-content .markdown-content pre code {
          color: #666 !important;
        }
        
        .thinking-content .markdown-content blockquote {
          border-left: 3px solid #d0d7de !important;
          color: #666 !important;
          margin-left: 0 !important;
          padding-left: 12px !important;
        }
        
        .thinking-content .markdown-content ul,
        .thinking-content .markdown-content ol {
          margin: 0 !important;
        }
        
        .thinking-content .markdown-content li {
          color: #666 !important;
          margin: 0 !important;
        }
        
        .ant-collapse-ghost > .ant-collapse-item > .ant-collapse-header {
          padding: 4px 0 !important;
        }
        
        .ant-collapse-ghost > .ant-collapse-item > .ant-collapse-content > .ant-collapse-content-box {
          padding: 0 !important;
        }
      `}</style>
    </div>
  );
};

export default ThinkingSection;
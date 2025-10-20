"use client";
import React, { useState } from "react";
import { Collapse } from "antd";
import { BulbOutlined } from "@ant-design/icons";
import { Streamdown } from "streamdown";

// 简化的样式定义 - 只保留必要的布局样式
const thinkingContentStyles: React.CSSProperties = {
  padding: '8px 0 8px 16px',
  marginTop: '4px',
  marginLeft: '4px',
  borderLeft: '3px solid #d0d7de',
  fontSize: '13px',
  color: '#666',
};

// 最小化的全局样式 - 只覆盖Collapse组件的样式
const globalStyles = `
  .thinking-collapse.ant-collapse-ghost > .ant-collapse-item > .ant-collapse-header {
    padding: 4px 0 !important;
  }

  .thinking-collapse.ant-collapse-ghost > .ant-collapse-item > .ant-collapse-content > .ant-collapse-content-box {
    padding: 0 !important;
  }
`;

export interface ThinkingRendererProps {
  content: string;
  duration?: number;
  defaultExpanded?: boolean;
  onExpandChange?: (expanded: boolean) => void;
}

const ThinkingRenderer: React.FC<ThinkingRendererProps> = ({
  content,
  duration,
  defaultExpanded = false,
  onExpandChange,
}) => {
  const [activeKeys, setActiveKeys] = useState<string[]>(
    defaultExpanded ? ["thinking"] : []
  );

  const handleChange = (keys: string | string[]) => {
    const keyArray = Array.isArray(keys) ? keys : [keys];
    setActiveKeys(keyArray);
    onExpandChange?.(keyArray.length > 0);
  };

  if (!content) {
    return null;
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
      <div style={{ marginBottom: '12px' }}>
        <Collapse
          activeKey={activeKeys}
          onChange={handleChange}
          ghost
          size="small"
          className="thinking-collapse"
          style={{
            backgroundColor: 'transparent',
          }}
        >
          <Collapse.Panel
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
              style={thinkingContentStyles}
              className="thinking-content-wrapper"
            >
              <Streamdown
                controls={{
                  code: true,
                  table: true,
                  mermaid: true,
                }}
              >
                {content}
              </Streamdown>
            </div>
          </Collapse.Panel>
        </Collapse>
      </div>
    </>
  );
};

export default ThinkingRenderer;
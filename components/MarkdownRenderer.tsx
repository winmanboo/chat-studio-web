"use client";
import React from "react";
import { Streamdown } from "streamdown";

// Streamdown渲染组件
const StreamdownRenderer: React.FC<{ content: string }> = React.memo(
  ({ content }) => {
    // 如果内容不是字符串，直接返回
    if (typeof content !== "string") {
      return content as React.ReactNode;
    }

    // 如果内容为空，返回空字符串
    if (!content) {
      return <div className="markdown-content"></div>;
    }

    return (
      <div className="markdown-content">
        <Streamdown
          controls={{
            code: true,
            table: true,
            mermaid: true,
          }}
          isAnimating={true}
        >
          {content}
        </Streamdown>
      </div>
    );
  }
);

StreamdownRenderer.displayName = "StreamdownRenderer";

// Markdown渲染函数
export const renderMarkdown = (content: string): React.ReactNode => {
  // 如果内容不是字符串，直接返回
  if (typeof content !== "string") {
    return content as React.ReactNode;
  }

  // 如果内容为空，返回空字符串
  if (!content) {
    return "";
  }

  return <StreamdownRenderer content={content} />;
};

export default StreamdownRenderer;

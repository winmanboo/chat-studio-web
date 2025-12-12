"use client";
import React from "react";
import XMarkdown, { type ComponentProps } from "@ant-design/x-markdown";
import Latex from "@ant-design/x-markdown/plugins/Latex";
import { CodeHighlighter, Mermaid } from "@ant-design/x";

const Code: React.FC<ComponentProps> = (props) => {
  const { className, children } = props;
  const lang = className?.match(/language-(\w+)/)?.[1] || "";

  if (typeof children !== "string") return null;
  if (lang === "mermaid") {
    return <Mermaid>{children}</Mermaid>;
  }
  return <CodeHighlighter lang={lang}>{children}</CodeHighlighter>;
};

// Markdown渲染组件
const MarkdownRendererInternal: React.FC<{ content: string }> = React.memo(
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
        <XMarkdown
          content={content}
          streaming={{
            enableAnimation: true,
            hasNextChunk: true,
            animationConfig: {
              fadeDuration: 400
            }
          }}
          style={{fontSize: "15px"}}
          components={{ code: Code }}
          paragraphTag="div"
          config={{ extensions: Latex() }}
        />
      </div>
    );
  }
);

MarkdownRendererInternal.displayName = "MarkdownRendererInternal";

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

  return <MarkdownRendererInternal content={content} />;
};

export default MarkdownRendererInternal;

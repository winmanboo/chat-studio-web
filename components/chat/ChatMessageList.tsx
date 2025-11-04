import React, { useState, useEffect } from "react";
import { Bubble } from "@ant-design/x";
import { Button, Space, theme, message, Tag } from "antd";
import {
  UserOutlined,
  RobotOutlined,
  CopyOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { renderMarkdown } from "@/components/MarkdownRenderer";
import RetrieveResultsDisplay from "@/components/RetrieveResultsDisplay";
import ThinkingRenderer from "@/components/ThinkingRenderer";
import ToolRenderer from "@/components/chat/ToolRenderer";
import { extractThinkingContent } from "@/lib/utils/thinkingUtils";
import { extractToolContent, incrementalParseTools, extractAllToolNames } from "@/lib/utils/toolUtils";

// 样式常量
const USER_AVATAR_STYLE = { backgroundColor: "#1890ff", color: "white" };
const ASSISTANT_AVATAR_STYLE = { backgroundColor: "#f0f0f0", color: "black" };

// 检索结果类型定义
interface RetrieveResult {
  chunkIndexs: string[];
  docId: string;
  kbId: number;
  title: string;
}

// 聊天消息类型定义
export interface ChatMessage {
  content: string;
  role: "user" | "assistant";
  avatar?: string;
  isLoading?: boolean;
  displayContent?: string; // 用于打字机效果的显示内容
  retrieveMode?: boolean; // 是否是检索模式
  kbName?: string; // 知识库名称
  retrieves?: RetrieveResult[]; // 检索结果
  thinking?: string; // 深度思考内容
  thinkingDuration?: number; // 深度思考耗时，单位为秒
  toolNames?: string[]; // 调用的工具名称列表，仅在ASSISTANT消息中存在
}

// 组件属性接口
export interface ChatMessageListProps {
  messages: ChatMessage[];
  style?: React.CSSProperties;
  className?: string;
  isViewingHistory?: boolean; // 是否正在查看历史消息
}

const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  style,
  className,
}) => {
  const { token } = theme.useToken();
  
  // 用于跟踪每条消息的工具解析状态
  const [messageToolStates, setMessageToolStates] = useState<Record<number, string[]>>({});

  // 初始化工具状态
  useEffect(() => {
    setMessageToolStates(prev => {
      const newStates: Record<number, string[]> = {};
      messages.forEach((_, index) => {
        if (prev[index]) {
          newStates[index] = prev[index];
        }
      });
      return newStates;
    });
  }, [messages]);

  // 处理工具状态更新，避免在渲染函数中直接调用setState
  useEffect(() => {
    let hasChanges = false;
    const newToolStates: Record<number, string[]> = {};
    
    messages.forEach((msg, index) => {
      const remainingContent = msg.displayContent || msg.content;
      
      // 使用新的函数直接提取所有工具名称
      const toolNamesFromContent = extractAllToolNames(remainingContent);
      
      if (toolNamesFromContent.length > 0) {
        const previousTools = messageToolStates[index] || [];
        
        // 只有当工具列表发生变化时才更新状态
        if (JSON.stringify(toolNamesFromContent) !== JSON.stringify(previousTools)) {
          newToolStates[index] = toolNamesFromContent;
          hasChanges = true;
        }
      }
    });
    
    if (hasChanges) {
      setMessageToolStates(prev => ({
        ...prev,
        ...newToolStates
      }));
    }
  }, [messages]);

  // 组件内样式定义
  const assistantBubbleStyles = `
    .assistant-bubble .ant-bubble-content {
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;
    }
  `;

  const onCopy = (msg: ChatMessage) => {
    navigator.clipboard.writeText(msg.content).then(
      () => {
        message.success("已复制到剪贴板");
      },
      (error) => {
        console.error("复制失败:", error);
        message.error("复制失败");
      }
    );
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: assistantBubbleStyles }} />
      <Bubble.List
        items={messages.map((msg, index) => ({
          key: index,
          content: { ...msg, messageIndex: index },
          role: msg.role,
          avatar:
            msg.role === "user"
              ? { icon: <UserOutlined />, style: USER_AVATAR_STYLE }
              : {
                  icon: <RobotOutlined />,
                  style: ASSISTANT_AVATAR_STYLE,
                },
          loading: msg.isLoading,
          variant: msg.role === "user" ? "filled" : "outlined",
        }))}
        roles={{
          user: {
            placement: "end",
            messageRender: (content) => {
              const msg = content as ChatMessage & { messageIndex: number };
              return (
                <div
                  style={{
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    lineHeight: "1.5",
                  }}
                >
                  {msg.displayContent || msg.content}
                </div>
              );
            },
            footer: (messageContext) => (
              <Space size={token.paddingXXS}>
                <Button
                  color="default"
                  variant="text"
                  size="small"
                  icon={<SyncOutlined />}
                />
                <Button
                  color="default"
                  variant="text"
                  size="small"
                  onClick={() => onCopy(messageContext as ChatMessage)}
                  icon={<CopyOutlined />}
                />
              </Space>
            ),
            avatar: {
              icon: <UserOutlined />,
              style: USER_AVATAR_STYLE,
            },
            className: "user-bubble",
          },
          assistant: {
            placement: "start",
            messageRender: (content) => {
              const msg = content as ChatMessage & { messageIndex: number };

              // 优先使用thinking字段，如果没有则从content中提取
              let thinkingText = msg.thinking;
              let remainingContent = msg.displayContent || msg.content;

              // 如果没有thinking字段，则尝试从content中提取
              if (!thinkingText) {
                const extracted = extractThinkingContent(
                  msg.displayContent || msg.content
                );
                thinkingText = extracted.thinkingText;
                remainingContent = extracted.remainingContent;
              }

              // 处理工具调用内容
              let toolNamesFromContent: string[] = [];
              let finalContent = remainingContent;

              // 使用新的函数直接提取所有工具名称
              const extractedToolNames = extractAllToolNames(remainingContent);
              if (extractedToolNames.length > 0) {
                // 使用已缓存的工具状态，避免在渲染函数中解析和更新状态
                toolNamesFromContent = messageToolStates[msg.messageIndex] || extractedToolNames;
                // 移除工具标签后的内容
                const toolExtracted = extractToolContent(remainingContent);
                finalContent = toolExtracted.remainingContent;
              }

              // 合并工具名称：优先使用从内容中提取的，然后是字段中的
              const allToolNames = [
                ...toolNamesFromContent,
                ...(msg.toolNames || [])
              ].filter((name, index, arr) => arr.indexOf(name) === index); // 去重

              return (
                <div>
                  {/* 深度思考区域 */}
                  {thinkingText && (
                    <ThinkingRenderer
                      content={thinkingText}
                      duration={msg.thinkingDuration}
                    />
                  )}

                  {/* 检索结果显示 */}
                  {msg.retrieveMode && msg.kbName && msg.retrieves && (
                    <RetrieveResultsDisplay
                      kbName={msg.kbName}
                      retrieves={msg.retrieves}
                    />
                  )}

                  {/* 工具调用显示 */}
                  {allToolNames.length > 0 && (
                    <ToolRenderer toolNames={allToolNames} />
                  )}

                  {/* 消息内容 */}
                  {finalContent && renderMarkdown(finalContent)}
                </div>
              );
            },
            footer: (messageContext) => (
              <Space size={token.paddingXXS}>
                <Button
                  color="default"
                  variant="text"
                  size="small"
                  icon={<SyncOutlined />}
                />
                <Button
                  color="default"
                  variant="text"
                  size="small"
                  onClick={() => onCopy(messageContext as ChatMessage)}
                  icon={<CopyOutlined />}
                />
              </Space>
            ),
            avatar: {
              icon: <RobotOutlined />,
              style: ASSISTANT_AVATAR_STYLE,
            },
            className: "assistant-bubble",
          },
        }}
        style={{
          width: "100%",
          minHeight: "100%",
          ...style,
        }}
        className={className}
      />
    </>
  );
};

export default ChatMessageList;
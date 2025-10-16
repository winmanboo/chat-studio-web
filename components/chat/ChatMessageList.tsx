import React from "react";
import { Bubble } from "@ant-design/x";
import { Button, Space, theme, message } from "antd";
import { UserOutlined, RobotOutlined, CopyOutlined, SyncOutlined } from "@ant-design/icons";
import { renderMarkdown } from "@/components/MarkdownRenderer";
import RetrieveResultsDisplay from "@/components/RetrieveResultsDisplay";
import ThinkingSection from "@/components/ThinkingSection";
import { extractThinkingContent } from "@/lib/utils/thinkingUtils";

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

  // 复制消息内容的处理函数
  const onCopy = async (messageContext: ChatMessage) => {
    const { copyToClipboard } = await import('@/lib/utils/clipboardUtils');
    const textToCopy = messageContext.displayContent || messageContext.content;
    
    try {
      await copyToClipboard(textToCopy, {
        onSuccess: () => message.success('已复制到剪贴板'),
        onError: (error) => {
          console.error('复制失败:', error);
          message.error('复制失败');
        }
      });
    } catch (error) {
      // 错误已在 onError 回调中处理
    }
  };
  return (
    <Bubble.List
      items={messages.map((msg, index) => ({
        key: index,
        content: msg, // 传递完整的消息对象
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
            const msg = content as ChatMessage;
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
              <Button color="default" variant="text" size="small" icon={<SyncOutlined />} />
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
            const msg = content as ChatMessage;
            
            // 优先使用thinking字段，如果没有则从content中提取
            let thinkingText = msg.thinking;
            let remainingContent = msg.displayContent || msg.content;
            
            // 如果没有thinking字段，则尝试从content中提取
            if (!thinkingText) {
              const extracted = extractThinkingContent(msg.displayContent || msg.content);
              thinkingText = extracted.thinkingText;
              remainingContent = extracted.remainingContent;
            }
            
            return (
              <div>
                {/* 深度思考区域 */}
                {thinkingText && (
                  <ThinkingSection 
                    content={thinkingText} 
                    defaultExpanded={false} // 统一设置为默认不展开
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
                
                {/* 消息内容 */}
                {remainingContent && renderMarkdown(remainingContent)}
              </div>
            );
          },
          footer: (messageContext) => (
            <Space size={token.paddingXXS}>
              <Button color="default" variant="text" size="small" icon={<SyncOutlined />} />
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
  );
};

export default ChatMessageList;
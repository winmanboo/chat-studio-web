import React from "react";
import { Bubble } from "@ant-design/x";
import { UserOutlined, RobotOutlined } from "@ant-design/icons";
import { renderMarkdown } from "@/components/MarkdownRenderer";
import RetrieveResultsDisplay from "@/components/RetrieveResultsDisplay";

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
}

// 组件属性接口
export interface ChatMessageListProps {
  messages: ChatMessage[];
  style?: React.CSSProperties;
  className?: string;
}

const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  style,
  className,
}) => {
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
            return (
              <div>
                {/* 检索结果显示 */}
                {msg.retrieveMode && msg.kbName && msg.retrieves && (
                  <RetrieveResultsDisplay
                    kbName={msg.kbName}
                    retrieves={msg.retrieves}
                  />
                )}
                {/* 消息内容 */}
                {renderMarkdown(msg.displayContent || msg.content)}
              </div>
            );
          },
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
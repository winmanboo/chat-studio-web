import { Avatar, Spin, Flex } from "antd";
import React from "react";
import { Streamdown } from "streamdown";

import ToolRenderer from "@/components/chat/ToolRenderer";
import { renderMarkdown } from "@/components/MarkdownRenderer";
import RetrieveResultsDisplay from "@/components/RetrieveResultsDisplay";
import { extractThinkingContent } from "@/lib/utils/thinkingUtils";
import { extractAllToolNames, extractToolContent } from "@/lib/utils/toolUtils";
import {
  LoadingOutlined,
  RobotOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Actions, Bubble, Think } from "@ant-design/x";

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
  modelName?: string; // 模型名称
}

// 组件属性接口
export interface ChatMessageListProps {
  messages: ChatMessage[];
  style?: React.CSSProperties;
  isViewingHistory?: boolean; // 是否正在查看历史消息
}

const ChatMessageList: React.FC<ChatMessageListProps> = ({ messages }) => {
  return (
    <>
      <Bubble.List
        style={{
          height: "100%",
          overflow: "auto",
          padding: "0 10%",
        }}
        autoScroll
        items={messages.map((msg, index) => ({
          key: index,
          content: { ...msg, messageIndex: index },
          role: msg.role,
          header: msg.role === "assistant" ? msg.modelName : undefined,
          loading: msg.isLoading,
          variant: msg.role === "user" ? "filled" : "borderless",
        }))}
        role={{
          user: {
            placement: "end",
            contentRender: (content: any) => {
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
            avatar: <Avatar icon={<UserOutlined />} />,
            className: "user-bubble",
          },
          assistant: {
            placement: "start",
            loadingRender: () => (
              <Flex align="center" gap="small">
                <Spin size="small" />
                飞速加载中...
              </Flex>
            ),
            contentRender: (content: any) => {
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
                // 直接使用提取的工具名称
                toolNamesFromContent = extractedToolNames;
                // 移除工具标签后的内容
                const toolExtracted = extractToolContent(remainingContent);
                finalContent = toolExtracted.remainingContent;
              }

              // 合并工具名称：优先使用从内容中提取的，然后是字段中的
              const allToolNames = [
                ...toolNamesFromContent,
                ...(msg.toolNames || []),
              ].filter((name, index, arr) => arr.indexOf(name) === index); // 去重

              return (
                <div>
                  {/* 深度思考区域 */}
                  {thinkingText && (
                    <Think blink defaultExpanded={false} title={"深度思考"}>
                      <Streamdown>{thinkingText}</Streamdown>
                    </Think>
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
            footer: (messageContext: any) => (
              <Actions
                items={[
                  {
                    key: "copy",
                    label: "copy",
                    actionRender: () => {
                      return <Actions.Copy text={messageContext.content} />;
                    },
                  },
                  {
                    key: "feedback",
                    actionRender: () => (
                      <Actions.Feedback
                        styles={{
                          liked: {
                            color: "#f759ab",
                          },
                        }}
                        key="feedback"
                      />
                    ),
                  },
                ]}
              />
            ),
            avatar: <Avatar icon={<RobotOutlined />} />,
          },
        }}
      />
    </>
  );
};

export default ChatMessageList;

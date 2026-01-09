import { Avatar, Card, Drawer, Flex, message, Spin, Tag, Typography, Image } from 'antd';
import React, { useState } from 'react';

import { renderMarkdown } from '@/components/MarkdownRenderer';
import { DocumentChunk, getRetrieveChunks } from '@/lib/api/documents';
import { extractThinkingContent } from '@/lib/utils/thinkingUtils';
import { extractAllToolNames, extractToolContent } from '@/lib/utils/toolUtils';
import {
    FileTextOutlined, LoadingOutlined, RobotOutlined, SearchOutlined, ToolOutlined, UserOutlined,
    FilePdfOutlined, VideoCameraOutlined, AudioOutlined
} from '@ant-design/icons';
import { Actions, Bubble, Sources, Think } from '@ant-design/x';

const { Text } = Typography;

// 检索结果类型定义
interface RetrieveResult {
  chunkIndexs?: string[];
  docId?: string;
  kbId?: number;
  title: string;
  url?: string; // Web搜索时的URL
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
  contentType?: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'PDF'; // 文件类型
  fileUrl?: string; // 文件链接
}

// 组件属性接口
export interface ChatMessageListProps {
  messages: ChatMessage[];
  style?: React.CSSProperties;
  isViewingHistory?: boolean; // 是否正在查看历史消息
  onPreview?: (content: string) => void;
}

const ChatMessageList: React.FC<ChatMessageListProps> = ({ messages, onPreview }) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerTitle, setDrawerTitle] = useState("");
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [retrievedChunks, setRetrievedChunks] = useState<DocumentChunk[]>([]);

  const handleSourceClick = async (
    docId: string,
    title: string,
    chunkIndexs: string[]
  ) => {
    setDrawerTitle(title);
    setDrawerVisible(true);
    setDrawerLoading(true);
    setRetrievedChunks([]);

    try {
      const chunks = await getRetrieveChunks(docId, chunkIndexs);
      setRetrievedChunks(chunks);
    } catch (error) {
      console.error("Failed to fetch chunks:", error);
      message.error("获取分块内容失败");
    } finally {
      setDrawerLoading(false);
    }
  };

  return (
    <>
      <Bubble.List
        style={{
          height: "100%",
          overflow: "auto",
          padding: "24px 0",
        }}
        autoScroll
        items={messages.map((msg, index) => ({
          key: index,
          style: { padding: "12px 10%" },
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
              
              // 渲染文件内容
              const renderFileContent = () => {
                if (!msg.contentType || !msg.fileUrl) return null;
                
                const fileStyle = { marginBottom: 8, maxWidth: '100%' };
                const placeholderStyle = { 
                  ...fileStyle, 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '8px 12px', 
                  background: 'rgba(0,0,0,0.05)', 
                  borderRadius: 8
                };
                
                switch (msg.contentType) {
                  case 'IMAGE':
                    return (
                      <div style={fileStyle}>
                        <Image
                          src={msg.fileUrl}
                          alt="Uploaded Image"
                          style={{ maxWidth: '300px', maxHeight: '300px', borderRadius: 8 }}
                        />
                      </div>
                    );
                  case 'VIDEO':
                    return (
                      <div style={placeholderStyle}>
                         <VideoCameraOutlined style={{ fontSize: 24, color: '#1890ff', marginRight: 8 }} />
                         <Text ellipsis style={{ maxWidth: 200 }}>视频文件</Text>
                      </div>
                    );
                  case 'AUDIO':
                    return (
                      <div style={placeholderStyle}>
                         <AudioOutlined style={{ fontSize: 24, color: '#13c2c2', marginRight: 8 }} />
                         <Text ellipsis style={{ maxWidth: 200 }}>音频文件</Text>
                      </div>
                    );
                  case 'PDF':
                    return (
                      <div style={placeholderStyle}>
                         <FilePdfOutlined style={{ fontSize: 24, color: '#ff4d4f', marginRight: 8 }} />
                         <Text ellipsis style={{ maxWidth: 200 }}>PDF文档</Text>
                      </div>
                    );
                  default:
                    return null;
                }
              };

              return (
                <div
                  style={{
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    lineHeight: "1.5",
                  }}
                >
                  {renderFileContent()}
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
              <Flex align="center" gap="small" style={{ opacity: 0.6 }}>
                <LoadingOutlined spin style={{ fontSize: 16 }} />
                <span style={{ fontSize: 14 }}>Thinking...</span>
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
                      {renderMarkdown(thinkingText)}
                    </Think>
                  )}

                  {/* 检索结果显示 */}
                  {msg.retrieveMode && msg.retrieves && (
                    <Sources
                      items={msg.retrieves.map((r) => ({
                        key: r.docId || r.url || r.title,
                        title: r.title,
                        icon: msg.kbName ? (
                          <FileTextOutlined />
                        ) : (
                          <SearchOutlined />
                        ),
                      }))}
                      onClick={(item) => {
                        const r = msg.retrieves?.find(
                          (retrieve) =>
                            (retrieve.docId ||
                              retrieve.url ||
                              retrieve.title) === item.key
                        );
                        if (r) {
                          if (msg.kbName) {
                            // 知识库检索模式
                            if (r.docId && r.chunkIndexs) {
                              handleSourceClick(
                                r.docId,
                                r.title,
                                r.chunkIndexs
                              );
                            }
                          } else {
                            // Web搜索模式
                            if (r.url) {
                              window.open(r.url, "_blank");
                            }
                          }
                        }
                      }}
                      title={
                        msg.kbName
                          ? `在知识库「${msg.kbName}」中找到 ${msg.retrieves.length} 个相关文件`
                          : `已搜索 ${msg.retrieves.length} 个网页内容`
                      }
                    />
                  )}

                  {/* 工具调用显示 */}
                  {allToolNames.length > 0 && (
                    <Sources
                      items={allToolNames.map((name) => ({
                        key: name,
                        title: name,
                        icon: <ToolOutlined />,
                      }))}
                      title="工具调用"
                    />
                  )}

                  {/* 消息内容 */}
                  {finalContent && renderMarkdown(finalContent, onPreview)}
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

      <Drawer
        title={drawerTitle}
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        size={600}
      >
        <Spin spinning={drawerLoading}>
          <Flex vertical gap={16}>
            {retrievedChunks.map((chunk, index) => (
              <Card
                key={chunk.chunkId || index}
                size="small"
                title={
                  <Flex align="center" gap="small">
                    <span>
                      分块{" "}
                      {chunk.chunkIndex !== undefined
                        ? chunk.chunkIndex
                        : index + 1}
                    </span>
                    {chunk.chunkId && (
                      <Tag color="blue">ID: {chunk.chunkId}</Tag>
                    )}
                  </Flex>
                }
                type="inner"
                variant="borderless"
              >
                <div
                  style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                >
                  {chunk.content}
                </div>
              </Card>
            ))}
          </Flex>
        </Spin>
      </Drawer>
    </>
  );
};

export default React.memo(ChatMessageList);

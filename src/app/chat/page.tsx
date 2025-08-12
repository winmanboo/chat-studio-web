"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Sender, 
  Conversations, 
  ConversationsProps,
  Bubble
} from "@ant-design/x";
import type { BubbleProps } from "@ant-design/x";
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import {
  PlusOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SearchOutlined,
  UploadOutlined,
  DatabaseOutlined,
  GlobalOutlined,
  ThunderboltOutlined,
  SettingOutlined,
  EditOutlined,
  DeleteOutlined,
  CommentOutlined,
  UserOutlined,
  RobotOutlined,
} from "@ant-design/icons";
import {
  Button,
  Divider,
  Flex,
  theme,
  Dropdown,
  Menu,
  Upload,
  message as antdMessage,
  Spin,
  Modal,
  Input,
  Space,
  Typography,
} from "antd";
import { createSession, chatStream, ChatRequest } from "@/api/conversations";

// 初始化 markdown-it
const md = new MarkdownIt({
  html: true,        // 启用HTML标签
  linkify: true,     // 自动转换URL为链接
  typographer: false, // 禁用typographer以避免isSpace错误
  breaks: true,      // 转换\n为<br>
  highlight: function (str: string, lang: string): string {
    if (lang && hljs.getLanguage(lang)) {
      try {
        const highlighted = hljs.highlight(str, { language: lang });
        return `<pre><code class="language-${lang}">${highlighted.value}</code></pre>`;
      } catch (error) {
        console.warn('代码高亮失败:', error);
      }
    }
    // 对于不支持的语言或高亮失败的情况，返回转义后的代码块
    return `<pre><code class="language-${lang || 'text'}">${md.utils.escapeHtml(str)}</code></pre>`;
  }
});

// Markdown渲染函数，参考官案
const renderMarkdown: BubbleProps['messageRender'] = (content) => {
  // 如果内容不是字符串，直接返回
  if (typeof content !== 'string') {
    return content as React.ReactNode;
  }
  
  // 如果内容为空，返回空字符串
  if (!content) {
    return '';
  }
  
  try {
    // 直接使用原始内容渲染，不进行额外的预处理
    const htmlContent = md.render(content);
    
    // 检查渲染后的HTML是否有效
    if (!htmlContent || htmlContent.trim() === '') {
      // 即使内容为空，也尝试渲染，可能包含代码块等元素
      return (
        <Typography>
          <div dangerouslySetInnerHTML={{ __html: htmlContent || '' }} />
        </Typography>
      );
    }
    
    return (
      <Typography>
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </Typography>
    );
  } catch (error) {
    // 如果渲染出错，显示原始内容并记录错误
    console.warn('Markdown渲染出错:', error);
    console.warn('出错内容:', content);
    // 即使出错也尝试渲染，将内容包装在基本的HTML标签中
    return (
      <Typography>
        <div dangerouslySetInnerHTML={{ __html: md.utils.escapeHtml(content) }} />
      </Typography>
    );
  }
};

const initialConversations = [
  { key: "1", label: "RAG开发", icon: "🤖", group: "今天" },
  { key: "2", label: "AI助手", icon: "🧑‍💻", group: "昨天" },
  { key: "3", label: "市场咨询", icon: "🛒", group: "三天前" },
  { key: "4", label: "产品反馈", icon: "💡", group: "一周前" },
  { key: "5", label: "团队群聊", icon: "👥", group: "一个月前" },
  { key: "6", label: "测试对话", icon: "🧪", group: "今天" },
];

// 聊天消息类型定义
interface ChatMessage {
  content: string;
  role: "user" | "assistant";
  avatar?: string;
  isLoading?: boolean;
  displayContent?: string; // 用于打字机效果的显示内容
}

// 定义会话项类型
interface ConversationItem {
  key: string;
  label: string;
  icon: string;
  group: string;
}

const ChatPage: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [conversations, setConversations] = useState<ConversationItem[]>(initialConversations);
  const [selectedId, setSelectedId] = useState(initialConversations[0].key);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const bubbleListRef = useRef<HTMLDivElement>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [editingConversation, setEditingConversation] = useState<{key: string, label: string} | null>(null);
  const [newConversationName, setNewConversationName] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null); // 用于存储会话ID
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState(''); // 用于控制Sender输入框的值

  const { token } = theme.useToken();
  // 检索模式与深度思考
  const [searchMode, setSearchMode] = useState<null | "web" | "kb">(null);
  const [deepThinking, setDeepThinking] = useState<boolean>(false);

  // 自动滚动到底部的函数
  const scrollToBottom = () => {
    if (bubbleListRef.current && !isUserScrolling) {
      const container = bubbleListRef.current;
      container.scrollTop = container.scrollHeight;
    }
  };

  // 监听消息变化，自动滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 监听用户滚动行为
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 50;
    setIsUserScrolling(!isAtBottom);
  };
  
  const modeLabel =
    searchMode === "web"
      ? "Web 搜索"
      : searchMode === "kb"
      ? "知识库"
      : "检索模式";
  
      
  // 检索模式菜单
  const searchMenu = (
    <Menu>
      <Menu.Item
        key="web"
        icon={<GlobalOutlined />}
        onClick={() => setSearchMode("web")}
      >
        Web搜索
      </Menu.Item>
      <Menu.Item
        key="kb"
        icon={<DatabaseOutlined />}
        onClick={() => setSearchMode("kb")}
      >
        知识库检索
      </Menu.Item>
    </Menu>
  );

  // 修改会话名称
  const handleEditConversation = (key: string, currentLabel: string) => {
    setEditingConversation({ key, label: currentLabel });
    setNewConversationName(currentLabel);
  };

  // 确认修改会话名称
  const confirmEditConversation = () => {
    if (editingConversation && newConversationName.trim()) {
      setConversations(prev => 
        prev.map(conv => 
          conv.key === editingConversation.key 
            ? { ...conv, label: newConversationName.trim() } 
            : conv
        )
      );
      if (selectedId === editingConversation.key) {
        antdMessage.success("会话名称已更新");
      }
      setEditingConversation(null);
      setNewConversationName('');
    }
  };

  // 删除会话
  const handleDeleteConversation = (key: string) => {
    if (conversations.length <= 1) {
      antdMessage.warning("至少需要保留一个会话");
      return;
    }
    
    const newConversations = conversations.filter(conv => conv.key !== key);
    setConversations(newConversations);
    
    // 如果删除的是当前选中的会话，切换到第一个会话
    if (selectedId === key) {
      setSelectedId(newConversations[0].key);
      setHasStarted(false);
      setSessionId(null); // 重置会话ID
      setMessages([]); // 清空消息
    }
    
    antdMessage.success("会话已删除");
  };

  // 为Conversations组件创建菜单项
  const conversationMenu: ConversationsProps['menu'] = (item) => ({
    items: [
      {
        label: '修改名称',
        key: 'edit',
        icon: <EditOutlined />,
      },
      {
        label: '删除会话',
        key: 'delete',
        icon: <DeleteOutlined />,
        danger: true,
      },
    ],
    onClick: (menuInfo) => {
      menuInfo.domEvent.stopPropagation();
      if (menuInfo.key === 'edit') {
        handleEditConversation(item.key, String(item.label || ''));
      } else if (menuInfo.key === 'delete') {
        handleDeleteConversation(item.key);
      }
    },
  });

  // 分组排序和标题自定义
  const groupable: ConversationsProps['groupable'] = {
    sort: (a: string, b: string): number => {
      // 定义分组的顺序
      const groupOrder: Record<string, number> = {
        '今天': 0,
        '昨天': 1,
        '三天前': 2,
        '一周前': 3,
        '一个月前': 4,
      };
      
      const orderA = groupOrder[a] !== undefined ? groupOrder[a] : Infinity;
      const orderB = groupOrder[b] !== undefined ? groupOrder[b] : Infinity;
      
      return orderA - orderB;
    },
    title: (group, { components: { GroupTitle } }) =>
      group ? (
        <GroupTitle>
          <Space>
            <CommentOutlined />
            <span>{group}</span>
          </Space>
        </GroupTitle>
      ) : (
        <GroupTitle />
      ),
  };

  // 新建对话逻辑：直接添加一条新对话
  const handleAddConversation = async () => {
    // 不再创建新会话，只切换界面布局
    const newId = Date.now().toString();
    setConversations([
      ...conversations,
      {
        key: newId,
        label: `新对话${conversations.length + 1}`,
        icon: "💬",
        group: "今天",
      },
    ]);
    setSelectedId(newId);
    antdMessage.success("已新建对话");
    setHasStarted(true); // 切换到Sender在底部的布局
    setSessionId(null); // 清除之前的sessionId
    setMessages([]); // 清空消息
  };

  // 发送消息
  const handleSubmit = async (message: string) => {
    // 如果还没有开始对话，设置为已开始状态
    if (!hasStarted) {
      setHasStarted(true);
    }
    
    // 如果还没有会话ID，则创建一个新会话
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      try {
        currentSessionId = await createSession();
        setSessionId(currentSessionId);
        // 注意：这里不再设置hasStarted，因为它应该在新建对话时就已经设置为true了
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "未知错误";
        antdMessage.error("创建会话失败: " + errorMessage);
        return;
      }
    }

    const userMessage: ChatMessage = { content: message, role: "user", avatar: "👤" };
    const aiMessage: ChatMessage = { 
      content: "", 
      role: "assistant", 
      avatar: "🤖",
      isLoading: true,
      displayContent: ""
    };
    
    // 添加用户消息和AI回复占位符
    setMessages(prev => [...prev, userMessage, aiMessage]);
    
    try {
      // 准备请求参数
      const requestData: ChatRequest = {
        sessionId: currentSessionId, // 直接使用currentSessionId，确保它是有效的
        prompt: message,
        searchEnabled: searchMode === "web",
        thinkingEnabled: deepThinking,
        ragEnabled: searchMode === "kb"
      };

      // 发起流式请求（现在在API层处理）
      const reader = await chatStream(requestData);

      const decoder = new TextDecoder();
      
      let fullContent = "";
      const messageIndex = messages.length + 1; // AI消息的索引
      
      // 更新AI消息为加载状态
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[messageIndex] = {
          ...newMessages[messageIndex],
          isLoading: false
        };
        return newMessages;
      });
      
      let accumulatedData = ""; // 用于累积数据块
      
      // 使用流式数据更新内容
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          // 处理剩余的累积数据
          if (accumulatedData.trim()) {
            // 处理累积的数据，可能包含多个消息
            const lines = accumulatedData.split('\n');
            for (const line of lines) {
              if (line.startsWith('data:')) {
                // 提取data:后面的内容
                const data = line.slice(5).trim();
                if (data !== '[DONE]') {
                  try {
                    // 尝试解析JSON数据
                    const jsonData = JSON.parse(data);
                    if (jsonData.content) {
                      fullContent += jsonData.content;
                    }
                  } catch (e) {
                    // 如果不是有效的JSON，直接使用原始数据
                    fullContent += data;
                  }
                }
              }
            }
            
            setMessages(prev => {
              const newMessages = [...prev];
              newMessages[messageIndex] = {
                ...newMessages[messageIndex],
                content: fullContent,
                displayContent: fullContent
              };
              return newMessages;
            });
          }
          break;
        }
        
        const chunk = decoder.decode(value, { stream: true });
        accumulatedData += chunk;
        
        // 处理完整的行
        let newlineIndex;
        while ((newlineIndex = accumulatedData.indexOf("\n")) !== -1) {
          const line = accumulatedData.substring(0, newlineIndex);
          accumulatedData = accumulatedData.substring(newlineIndex + 1);
          
          // 处理每个消息行
          if (line.startsWith('data:')) {
            // 提取data:后面的内容
            const data = line.slice(5).trim();
            if (data !== '[DONE]') {
              try {
                // 尝试解析JSON数据
                const jsonData = JSON.parse(data);
                if (jsonData.content) {
                  fullContent += jsonData.content;
                }
              } catch (e) {
                // 如果不是有效的JSON，直接使用原始数据
                fullContent += data;
              }
              
              // 直接更新消息内容
              setMessages(prev => {
                const newMessages = [...prev];
                newMessages[messageIndex] = {
                  ...newMessages[messageIndex],
                  content: fullContent,
                  displayContent: fullContent
                };
                return newMessages;
              });
            }
          }
        }
      }
      
    } catch (error: unknown) {
      console.error("消息发送失败:", error); // 在控制台输出详细错误信息
      const errorMessage = error instanceof Error ? error.message : "未知错误";
      antdMessage.error("消息发送失败: " + errorMessage);
      // 更新AI消息状态为错误
      setMessages(prev => 
        prev.map((msg, idx) => 
          idx === prev.length - 1 
            ? { ...msg, isLoading: false, content: "抱歉，消息发送失败，请稍后重试。" }
            : msg
        )
      );
    }
  };

  // 主区域对齐：未开始时居中，开始后拉伸填满
  const mainAlignItems = hasStarted ? "stretch" : "center";
  const mainJustify = hasStarted ? "flex-start" : "center";


  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        background: "#fff",
        display: "flex",
        flexDirection: "row",
      }}
    >
      {/* 左侧对话管理区 */}
      <div
        style={{
          width: collapsed ? 48 : 220,
          transition: "width 0.2s",
          borderRight: "1px solid #f0f0f0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: "#fafbfc",
          height: "100%",
          color: "#222",
        }}
      >
        {collapsed ? (
          // 折叠状态下只显示展开按钮
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Button
              type="text"
              icon={<MenuUnfoldOutlined />}
              onClick={() => setCollapsed(false)}
              style={{ 
                fontSize: 18,
                color: token.colorText
              }}
            />
          </div>
        ) : (
          // 展开状态显示完整内容
          <>
            {/* 新建对话按钮（替换原顶部文字） */}
            <div
              style={{
                width: "100%",
                padding: "16px 0 8px 0",
                textAlign: "center",
                borderBottom: "1px solid #f0f0f0",
                position: "relative",
                color: "#222",
              }}
            >
              <Flex justify="center" gap={8}>
                <Button
                  type="text"
                  icon={<PlusOutlined />}
                  style={{ fontWeight: "bold", fontSize: 18 }}
                  onClick={handleAddConversation}
                >
                  新建对话
                </Button>
                <Button
                  type="text"
                  icon={<SettingOutlined />}
                  style={{ fontWeight: "bold", fontSize: 18 }}
                  onClick={() => antdMessage.info("设置功能开发中")}
                >
                  设置
                </Button>
              </Flex>
            </div>
            <div
              style={{
                flex: 1,
                width: "100%",
                overflowY: "auto",
                padding: 8,
              }}
            >
              <Conversations
                style={{ width: "100%", color: "#222" }}
                items={conversations}
                activeKey={selectedId}
                onActiveChange={(key) => {
                  setSelectedId(key);
                  setHasStarted(false);
                  setSessionId(null); // 切换会话时重置sessionId
                  setMessages([]); // 清空消息
                }}
                menu={conversationMenu}
                groupable={groupable}
              />
            </div>
            <div
              style={{
                width: "100%",
                padding: 8,
                borderTop: "1px solid #f0f0f0",
                textAlign: "center",
              }}
            >
              <Button
                type="text"
                icon={<MenuFoldOutlined />}
                onClick={() => setCollapsed(true)}
                style={{ width: "100%" }}
              >
                收起
              </Button>
            </div>
          </>
        )}
      </div>
      {/* 右侧聊天区 */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          minHeight: 0,
        }}
      >
        {!hasStarted ? (
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
            }}
          >
            <div
              style={{
                fontSize: 40,
                fontWeight: 700,
                marginBottom: 24,
                color: "#222",
                letterSpacing: 2,
              }}
            >
              Chat Studio
            </div>
            <div
              style={{
                width: "54%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "2vh 0",
              }}
            >
              <Sender
                value={inputValue}
                onChange={(val) => setInputValue(val)}
                placeholder="请输入内容并回车..."
                allowSpeech={false}
                actions={false}
                onSubmit={(val) => {
                  handleSubmit(val);
                  setInputValue(''); // 提交后清空输入框
                }}
                footer={({ components }) => {
                  const { SendButton, SpeechButton } = components;
                  return (
                    <Flex justify="space-between" align="center">
                      {/* 左侧：检索模式 + 深度思考 */}
                      <Flex gap="small" align="center">
                        <Dropdown
                          overlay={searchMenu}
                          trigger={["click"]}
                          placement="topLeft"
                        >
                          <Button
                            type="text"
                            icon={
                              <SearchOutlined
                                style={{
                                  color: searchMode
                                    ? token.colorPrimary
                                    : token.colorText,
                                  fontSize: 15,
                                }}
                              />
                            }
                            style={{
                              fontSize: 15,
                              color: searchMode
                                ? token.colorPrimary
                                : token.colorText,
                            }}
                            onClick={() => {}}
                          >
                            {modeLabel}
                          </Button>
                        </Dropdown>
                        <Divider type="vertical" />
                        <Button
                          type="text"
                          icon={
                            <ThunderboltOutlined
                              style={{
                                color: deepThinking
                                  ? token.colorPrimary
                                  : token.colorText,
                                fontSize: 15,
                              }}
                            />
                          }
                          style={{
                            fontSize: 15,
                            color: deepThinking
                              ? token.colorPrimary
                              : token.colorText,
                          }}
                          onClick={() => setDeepThinking((v) => !v)}
                        >
                          深度思考
                        </Button>
                      </Flex>
                      {/* 右侧：上传附件（语音左侧） + 语音 + 发送 */}
                      <Flex align="center" gap={8}>
                        <Upload
                          showUploadList={false}
                          beforeUpload={() => {
                            antdMessage.info("上传文件功能开发中");
                            return false;
                          }}
                        >
                          <Button
                            type="text"
                            icon={
                              <UploadOutlined
                                style={{ fontSize: 15 }}
                              />
                            }
                            style={{ fontSize: 18, color: token.colorText }}
                          />
                        </Upload>
                        <Divider type="vertical" />
                        <SpeechButton style={{ fontSize: 15, color: token.colorText }} />
                        <Divider type="vertical" />
                        <SendButton type="primary" disabled={false} />
                      </Flex>
                    </Flex>
                  );
                }}
              />
            </div>
          </div>
        ) : (
          <>
            <div
              ref={bubbleListRef}
              onScroll={handleScroll}
              style={{
                flex: 1,
                overflowY: "auto",
                width: "100%",
                minHeight: 0, // 确保flex子项可以收缩
                maxHeight: "calc(100vh - 200px)", // 限制最大高度，为Sender留出空间
              }}
            >
              {/* 使用Bubble.List替换原来的手动实现 */}
              <div style={{ padding: "4vh 10% 2vh 10%" }}>
                <Bubble.List
                  items={messages.map((item) => ({
                    content: item.displayContent !== undefined ? item.displayContent : item.content,
                    role: item.role,
                    loading: item.isLoading,
                  }))}
                  roles={{
                    user: {
                      placement: 'end',
                      avatar: {
                        icon: <UserOutlined />,
                        style: { 
                          backgroundColor: '#1890ff',
                          color: 'white',
                        }
                      },
                    },
                    assistant: {
                      placement: 'start',
                      messageRender: renderMarkdown, // 为AI助手消息添加Markdown渲染
                      avatar: {
                        icon: <RobotOutlined />,
                        style: { 
                          backgroundColor: '#f0f0f0',
                          color: 'black',
                        }
                      }
                    },
                  }}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
            <div style={{ 
              flexShrink: 0, // 防止在flex布局中被压缩
              padding: "16px 0",
              background: '#fff',
              borderTop: '1px solid #f0f0f0', // 添加顶部边框分隔
            }}>
              <div style={{ 
                width: "80%", 
                margin: "0 auto",
                display: "flex",
                justifyContent: "center",
              }}>
                <Sender
                  value={inputValue}
                  onChange={(val) => setInputValue(val)}
                  placeholder="请输入内容并回车..."
                  allowSpeech
                  actions={false as const}
                  onSubmit={(val) => {
                    handleSubmit(val);
                    setInputValue(''); // 提交后清空输入框
                  }}
                  footer={({ components }) => {
                    const { SendButton, SpeechButton } = components;
                    return (
                      <Flex justify="space-between" align="center">
                        {/* 左侧：检索模式 + 深度思考 */}
                        <Flex gap="small" align="center">
                          <Dropdown
                            overlay={searchMenu}
                            trigger={["click"]}
                            placement="topLeft"
                          >
                            <Button
                              type="text"
                              icon={
                                <SearchOutlined
                                  style={{
                                    color: searchMode
                                      ? token.colorPrimary
                                      : token.colorText,
                                    fontSize: 15,
                                  }}
                                />
                              }
                              style={{
                                fontSize: 15,
                                color: searchMode
                                  ? token.colorPrimary
                                  : token.colorText,
                              }}
                            >
                              {modeLabel}
                            </Button>
                          </Dropdown>
                          <Divider type="vertical" />
                          <Button
                            type="text"
                            icon={
                              <ThunderboltOutlined
                                style={{
                                  color: deepThinking
                                    ? token.colorPrimary
                                    : token.colorText,
                                  fontSize: 15,
                                }}
                              />
                            }
                            style={{
                              fontSize: 15,
                              color: deepThinking
                                ? token.colorPrimary
                                : token.colorText,
                            }}
                            onClick={() => setDeepThinking((v) => !v)}
                          >
                            深度思考
                          </Button>
                        </Flex>
                        {/* 右侧：上传附件（语音左侧） + 语音 + 发送 */}
                        <Flex align="center" gap={8}>
                          <Upload
                            showUploadList={false}
                            beforeUpload={() => {
                              antdMessage.info("上传文件功能开发中");
                              return false;
                            }}
                          >
                            <Button
                              type="text"
                              icon={
                                <UploadOutlined
                                  style={{ fontSize: 15 }}
                                />
                              }
                              style={{ fontSize: 18, color: token.colorText }}
                            />
                          </Upload>
                          <Divider type="vertical" />
                          <SpeechButton style={{ fontSize: 15, color: token.colorText }} />
                          <Divider type="vertical" />
                          <SendButton type="primary" disabled={false} />
                        </Flex>
                      </Flex>
                    );
                  }}
                />
              </div>
            </div>
          </>
        )}
      </div>
      {/* 编辑会话名称的模态框 */}
      <Modal
        title="修改会话名称"
        open={!!editingConversation}
        onOk={confirmEditConversation}
        onCancel={() => setEditingConversation(null)}
        destroyOnClose
      >
        <Input
          value={newConversationName}
          onChange={(e) => setNewConversationName(e.target.value)}
          onPressEnter={confirmEditConversation}
          placeholder="请输入会话名称"
        />
      </Modal>
    </div>
  );
};

export default ChatPage;
"use client";

import React, { useState, useEffect } from "react";
import { Bubble, Sender, Conversations, ConversationsProps } from "@ant-design/x";
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
} from "antd";

// 初始化 markdown-it
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value;
      } catch (__) {}
    }
    return ''; // 使用默认的转义
  }
});

const initialConversations = [
  { key: "1", label: "RAG开发", icon: "🤖" },
  { key: "2", label: "AI助手", icon: "🧑‍💻" },
  { key: "3", label: "市场咨询", icon: "🛒" },
  { key: "4", label: "产品反馈", icon: "💡" },
  { key: "5", label: "团队群聊", icon: "👥" },
  { key: "6", label: "测试对话", icon: "🧪" },
];

// 定义消息类型
interface ChatMessage {
  content: string;
  role: "user" | "assistant";
  avatar?: string;
  isLoading?: boolean;
  isTyping?: boolean;
  displayContent?: string;
}

const ChatPage: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [conversations, setConversations] = useState(initialConversations);
  const [selectedId, setSelectedId] = useState(initialConversations[0].key);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hasStarted, setHasStarted] = useState(false);
  const [editingConversation, setEditingConversation] = useState<{key: string, label: string} | null>(null);
  const [newConversationName, setNewConversationName] = useState('');

  // 打字机效果
  const typewriterEffect = (messageIndex: number, fullContent: string) => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      setMessages(prev => 
        prev.map((msg, idx) => 
          idx === messageIndex 
            ? { ...msg, displayContent: fullContent.slice(0, currentIndex + 1) }
            : msg
        )
      );
      currentIndex++;
      if (currentIndex >= fullContent.length) {
        clearInterval(interval);
        setMessages(prev => 
          prev.map((msg, idx) => 
            idx === messageIndex 
              ? { ...msg, isTyping: false, displayContent: fullContent }
            : msg
          )
        );
      }
    }, 50); // 每50ms显示一个字符
  };

  // 新建对话逻辑：直接添加一条新对话
  const handleAddConversation = () => {
    const newId = Date.now().toString();
    setConversations([
      ...conversations,
      {
        key: newId,
        label: `新对话${conversations.length + 1}`,
        icon: "💬",
      },
    ]);
    setSelectedId(newId);
    antdMessage.success("已新建对话");
    setMessages([]);
    setHasStarted(false);
  };

  // 发送消息
  const handleSubmit = (message: string) => {
    if (!hasStarted) setHasStarted(true);
    const userMessage: ChatMessage = { content: message, role: "user", avatar: "👤" };
    const aiMessage: ChatMessage = { 
      content: `这是一个模拟的AI回复，支持**Markdown**格式。

## 功能特性
- 支持列表项
- 支持代码高亮
- 支持*斜体*和**粗体**
- 支持链接：[GitHub](https://github.com)

### 代码示例
\`\`\`javascript
function hello() {
  console.log('Hello World!');
  return 'Hello from AI';
}
\`\`\`

\`\`\`python
def greet(name):
    return f"Hello, {name}!"
\`\`\`

### 表格示例
| 功能 | 状态 | 说明 |
|------|------|------|
| Markdown | ✅ | 完全支持 |
| 代码高亮 | ✅ | 语法高亮 |
| 打字机效果 | ✅ | 逐字显示 |

> 这是一个引用块，展示引用效果。

\`行内代码\` 也可以正常显示。`, 
      role: "assistant", 
      avatar: "🤖",
      isLoading: true,
      isTyping: false,
      displayContent: ""
    };
    
    setMessages(prev => [...prev, userMessage, aiMessage]);
    
    // 模拟AI回复延迟
    setTimeout(() => {
      setMessages(prev => 
        prev.map((msg, idx) => 
          idx === prev.length - 1 
            ? { ...msg, isLoading: false, isTyping: true }
            : msg
        )
      );
      
      // 开始打字机效果
      setTimeout(() => {
        typewriterEffect(messages.length + 1, aiMessage.content);
      }, 500);
    }, 1500);
  };

  const { token } = theme.useToken();
  const iconStyle = {
    fontSize: 15,
    color: token.colorText,
  };
  const smallIconStyle = {
    fontSize: 18,
    color: token.colorText,
  };
  // 检索模式与深度思考
  const [searchMode, setSearchMode] = useState<null | "web" | "kb">(null);
  const [deepThinking, setDeepThinking] = useState<boolean>(false);
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
      setMessages([]);
      setHasStarted(false);
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
        {/* 新建对话按钮（替换原顶部文字） */}
        {!collapsed && (
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
              />
            </Flex>
          </div>
        )}
        <div
          style={{
            flex: 1,
            width: "100%",
            overflowY: "auto",
            padding: collapsed ? 0 : 8,
          }}
        >
          <Conversations
            style={{ width: "100%", color: "#222" }}
            items={conversations}
            activeKey={selectedId}
            onActiveChange={(key) => {
              setSelectedId(key);
              setMessages([]);
              setHasStarted(false);
            }}
            menu={conversationMenu}
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
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed((v) => !v)}
            style={{ width: "100%" }}
          >
            {!collapsed && "收起"}
          </Button>
        </div>
      </div>
      {/* 右侧聊天区 */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: mainJustify,
          alignItems: mainAlignItems,
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
                padding: "4vh 0",
              }}
            >
              <Sender
                onSubmit={handleSubmit}
                placeholder="请输入内容并回车..."
                allowSpeech
                actions={false}
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
                                  fontSize: iconStyle.fontSize,
                                }}
                              />
                            }
                            style={{
                              fontSize: iconStyle.fontSize,
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
                                fontSize: iconStyle.fontSize,
                              }}
                            />
                          }
                          style={{
                            fontSize: iconStyle.fontSize,
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
                                style={{ fontSize: iconStyle.fontSize }}
                              />
                            }
                            style={smallIconStyle}
                          />
                        </Upload>
                        <Divider type="vertical" />
                        <SpeechButton style={iconStyle} />
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
              style={{
                height: 'calc(100vh - 200px)', // 固定高度，减去header和sender的高度
                padding: "4vh 0",
                overflowY: "auto",
                width: "80%",
                margin: "0 auto",
              }}
              className="chat-messages"
            >
              {messages.map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: item.role === 'user' ? 'flex-end' : 'flex-start',
                    marginBottom: 16,
                    alignItems: 'flex-start',
                    gap: 8,
                  }}
                >
                  {item.role === 'assistant' && (
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: '#f0f0f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 16,
                        flexShrink: 0,
                      }}
                    >
                      {item.avatar || '🤖'}
                    </div>
                  )}
                  <div
                    style={{
                      maxWidth: '95%',
                      background: item.role === 'user' ? '#1890ff' : '#f5f5f5',
                      color: item.role === 'user' ? 'white' : '#333',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      lineHeight: '1.5',
                    }}
                  >
                    {item.role === 'assistant' ? (
                      <>
                        {item.isLoading ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Spin size="small" />
                            <span>AI正在思考...</span>
                          </div>
                        ) : (
                          <div
                            dangerouslySetInnerHTML={{
                              __html: md.render(item.displayContent || item.content)
                            }}
                            style={{
                              lineHeight: '1.6',
                            }}
                            className="markdown-content"
                          />
                        )}
                      </>
                    ) : (
                      <span>{item.content}</span>
                    )}
                  </div>
                  {item.role === 'user' && (
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: '#1890ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 16,
                        color: 'white',
                        flexShrink: 0,
                      }}
                    >
                      {item.avatar || '👤'}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div style={{ 
              position: 'fixed', 
              bottom: 0, 
              left: collapsed ? 48 : 220, // 根据左侧Conversation的宽度调整
              right: 0,
              padding: "4vh 0",
              zIndex: 1000,
              transition: 'left 0.2s', // 与Conversation收缩动画保持一致
            }}>
              <div style={{ 
                width: "80%", 
                margin: "0 auto",
                display: "flex",
                justifyContent: "center",
              }}>
                <Sender
                  onSubmit={handleSubmit}
                  allowSpeech
                  placeholder="请输入内容并回车..."
                  actions={false}
                  style={{ width: "100%" }}
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
                                    fontSize: iconStyle.fontSize,
                                  }}
                                />
                              }
                              style={{
                                fontSize: iconStyle.fontSize,
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
                                  fontSize: iconStyle.fontSize,
                                }}
                              />
                            }
                            style={{
                              fontSize: iconStyle.fontSize,
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
                                  style={{ fontSize: iconStyle.fontSize }}
                                />
                              }
                              style={smallIconStyle}
                            />
                          </Upload>
                          <Divider type="vertical" />
                          <SpeechButton style={iconStyle} />
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

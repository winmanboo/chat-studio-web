"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Sender, 
  Conversations, 
  ConversationsProps,
  Bubble
} from "@ant-design/x";

import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import mermaid from 'mermaid';
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
import { createSession, chatStream, ChatRequest, getSessionList, SessionItem, getSessionMessages, SessionMessage, deleteSession } from "@/api/conversations";

// 样式常量
const ICON_SIZE = 15;
const BUTTON_SIZE = 18;
const BOLD_BUTTON_STYLE = { fontWeight: "bold", fontSize: BUTTON_SIZE };
const USER_AVATAR_STYLE = { backgroundColor: '#1890ff', color: 'white' };
const ASSISTANT_AVATAR_STYLE = { backgroundColor: '#f0f0f0', color: 'black' };

// 时间分组函数
const getTimeGroup = (timestamp: number): string => {
  const now = new Date();
  const sessionDate = new Date(timestamp);
  
  // 获取今天0点的时间戳
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  // 获取昨天0点的时间戳
  const yesterdayStart = todayStart - 24 * 60 * 60 * 1000;
  // 获取三天前0点的时间戳
  const threeDaysAgoStart = todayStart - 3 * 24 * 60 * 60 * 1000;
  // 获取一周前0点的时间戳
  const oneWeekAgoStart = todayStart - 7 * 24 * 60 * 60 * 1000;
  // 获取一个月前0点的时间戳
  const oneMonthAgoStart = todayStart - 30 * 24 * 60 * 60 * 1000;

  if (timestamp >= todayStart) {
    return '今天';
  } else if (timestamp >= yesterdayStart) {
    return '昨天';
  } else if (timestamp >= threeDaysAgoStart) {
    return '三天前';
  } else if (timestamp >= oneWeekAgoStart) {
    return '一周前';
  } else if (timestamp >= oneMonthAgoStart) {
    return '一个月前';
  } else {
    return '更早';
  }
};

// 将API数据转换为组件所需格式
const convertSessionToConversation = (session: SessionItem): ConversationItem => {
  return {
    key: session.sessionId,
    label: session.sessionTitle,
    icon: '💬', // 默认图标
    group: getTimeGroup(session.createdAt)
  };
};

// 将API消息转换为组件消息格式
const convertSessionMessageToChatMessage = (sessionMessage: SessionMessage): ChatMessage => {
  return {
    content: sessionMessage.message,
    role: sessionMessage.messageType === 'USER' ? 'user' : 'assistant',
    avatar: sessionMessage.messageType === 'USER' ? '👤' : '🤖'
  };
};

// 加载会话消息
const loadSessionMessages = async (sessionId: string): Promise<ChatMessage[]> => {
  try {
    const sessionMessages = await getSessionMessages(sessionId);
    // 按照parentId关系排序消息，确保消息顺序正确
    const sortedMessages = sessionMessages.sort((a, b) => a.id - b.id);
    return sortedMessages.map(convertSessionMessageToChatMessage);
  } catch (error) {
    console.error('加载会话消息失败:', error);
    throw error;
  }
};

// 初始化 markdown-it
const md = new MarkdownIt({
  html: true,        // 启用HTML标签
  linkify: true,     // 自动转换URL为链接
  typographer: false, // 禁用typographer以避免isSpace错误
  breaks: true,      // 转换\n为<br>
  highlight: function (str: string, lang: string): string {
    const languageLabel = lang || 'text';
    const displayLang = languageLabel === 'text' ? 'plain' : languageLabel;
    
    // 处理Mermaid图表
     if (lang === 'mermaid') {
       const mermaidId = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9).replace(/[^a-zA-Z0-9]/g, '')}`;
       return `<div class="mermaid-container"><div class="code-header"><span class="language-label">mermaid</span><button class="copy-button" onclick="copyCodeToClipboard(this)">复制</button></div><div class="mermaid" id="${mermaidId}">${str}</div></div>`;
     }
    
    // 添加行号的函数
    const addLineNumbers = (code: string): string => {
        const lines = code.split('\n');
        // 移除最后一个空行（如果存在）
        if (lines.length > 0 && lines[lines.length - 1] === '') {
          lines.pop();
        }
        
        const lineNumbers = lines.map((_, index) => `<span class="line-number">${index + 1}</span>`).join('');
        const codeLines = lines.map(line => `<span class="code-line">${line || ' '}</span>`).join('');
        
        return `<div class="line-numbers">${lineNumbers}</div><div class="code-content">${codeLines}</div>`;
      };
    
    if (lang && hljs.getLanguage(lang)) {
      try {
        const highlighted = hljs.highlight(str, { language: lang });
        const codeWithLines = addLineNumbers(highlighted.value);
        return `<div class="code-block-container"><div class="code-header"><span class="language-label">${displayLang}</span><button class="copy-button" onclick="copyCodeToClipboard(this)">复制</button></div><pre><code class="language-${lang}">${codeWithLines}</code></pre></div>`;
      } catch (error) {
        console.warn('代码高亮失败:', error);
        // 高亮失败时返回转义后的代码块
        const escapedCode = md.utils.escapeHtml(str);
        const codeWithLines = addLineNumbers(escapedCode);
        return `<div class="code-block-container"><div class="code-header"><span class="language-label">${displayLang}</span><button class="copy-button" onclick="copyCodeToClipboard(this)">复制</button></div><pre><code class="language-${lang}">${codeWithLines}</code></pre></div>`;
      }
    }
    // 对于不支持的语言或高亮失败的情况，返回转义后的代码块
    const escapedCode = md.utils.escapeHtml(str);
    const codeWithLines = addLineNumbers(escapedCode);
    return `<div class="code-block-container"><div class="code-header"><span class="language-label">${displayLang}</span><button class="copy-button" onclick="copyCodeToClipboard(this)">复制</button></div><pre><code class="language-${languageLabel}">${codeWithLines}</code></pre></div>`;
  }
});

// 扩展Window接口以支持复制函数
declare global {
  interface Window {
    copyCodeToClipboard: (button: HTMLButtonElement) => void;
  }
}

// 复制代码到剪贴板的全局函数
if (typeof window !== 'undefined') {
  window.copyCodeToClipboard = function(button: HTMLButtonElement) {
    const container = button.closest('.code-block-container');
    if (!container) return;
    
    const codeContent = container.querySelector('.code-content');
    let text = '';
    
    if (!codeContent) {
      // 降级处理：如果没有找到.code-content，使用整个code元素
      const code = container.querySelector('code');
      if (!code) return;
      text = code.textContent || '';
    } else {
      // 从.code-line元素中重建原始代码，保留换行符
      const codeLines = codeContent.querySelectorAll('.code-line');
      const lines: string[] = [];
      
      codeLines.forEach(line => {
        // 获取每行的文本内容，如果是空行则保留为空字符串
        const lineText = line.textContent || '';
        // 如果行内容只是一个空格（用于显示空行），则转换为空字符串
        lines.push(lineText === ' ' ? '' : lineText);
      });
      
      // 用换行符连接所有行
      text = lines.join('\n');
    }
    
    navigator.clipboard.writeText(text).then(() => {
      // 显示复制成功状态
      button.classList.add('copied');
      const originalText = button.textContent;
      button.textContent = '已复制';
      
      // 2秒后恢复原状态
      setTimeout(() => {
        button.classList.remove('copied');
        button.textContent = originalText;
      }, 2000);
    }).catch(err => {
      console.error('复制失败:', err);
      // 降级处理：使用旧的复制方法
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        button.classList.add('copied');
        const originalText = button.textContent;
        button.textContent = '已复制';
        
        setTimeout(() => {
          button.classList.remove('copied');
          button.textContent = originalText;
        }, 2000);
      } catch (fallbackErr) {
        console.error('降级复制也失败:', fallbackErr);
      }
    });
  };
}

// Markdown渲染函数，增强错误处理
// Mermaid渲染组件
const MermaidRenderer: React.FC<{ content: string }> = React.memo(({ content }) => {
  const [htmlContent, setHtmlContent] = React.useState('');
  const containerRef = React.useRef<HTMLDivElement>(null);
  const mermaidInitialized = React.useRef(false);
  const lastContentRef = React.useRef<string>('');
  const renderedHtmlRef = React.useRef<string>('');
  
  // 初始化Mermaid（只执行一次）
  React.useEffect(() => {
    if (typeof window !== 'undefined' && !mermaidInitialized.current) {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
        fontFamily: 'inherit'
      });
      mermaidInitialized.current = true;
    }
  }, []);
  
  React.useEffect(() => {
    // 只有当内容真正改变时才重新渲染
    if (content !== lastContentRef.current) {
      lastContentRef.current = content;
      
      // 预处理内容，确保代码块格式正确
      let processedContent = content;
      
      // 修复可能的代码块格式问题
      // 确保代码块前后有足够的换行符
      processedContent = processedContent.replace(/(```[\s\S]*?```)/g, (match) => {
        return '\n' + match + '\n';
      });
      
      // 渲染Markdown
      const rendered = md.render(processedContent);
      
      // 只有当渲染结果真正改变时才更新状态
      if (rendered !== renderedHtmlRef.current) {
        renderedHtmlRef.current = rendered;
        setHtmlContent(rendered);
      }
    }
  }, [content]);
  
  // 渲染Mermaid图表
  React.useEffect(() => {
    if (typeof window !== 'undefined' && htmlContent && containerRef.current) {
      const container = containerRef.current;
      
      // 使用setTimeout确保DOM已经更新
      setTimeout(() => {
        // 查找容器内未处理的Mermaid图表
        const mermaidElements = container.querySelectorAll('.mermaid:not([data-processed])');
        
        mermaidElements.forEach(async (element) => {
          try {
            const graphDefinition = element.textContent || '';
            if (graphDefinition.trim()) {
              const uniqueId = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9).replace(/[^a-zA-Z0-9]/g, '')}`;
              const { svg } = await mermaid.render(uniqueId, graphDefinition);
              element.innerHTML = svg;
              element.setAttribute('data-processed', 'true');
            }
          } catch (error) {
            console.warn('Mermaid渲染失败:', error);
            element.innerHTML = `<pre style="color: red;">Mermaid图表渲染失败: ${error}</pre>`;
            element.setAttribute('data-processed', 'true');
          }
        });
      }, 0);
    }
  }, [htmlContent]);
  
  return (
    <Typography>
      <div 
        ref={containerRef}
        dangerouslySetInnerHTML={{ __html: htmlContent }} 
        className="markdown-content"
      />
    </Typography>
  );
});

MermaidRenderer.displayName = 'MermaidRenderer';

const renderMarkdown = (content: string): React.ReactNode => {
  // 如果内容不是字符串，直接返回
  if (typeof content !== 'string') {
    return content as React.ReactNode;
  }
  
  // 如果内容为空，返回空字符串
  if (!content) {
    return '';
  }
  
  try {
    return <MermaidRenderer content={content} />;
  } catch (error) {
    // 如果渲染出错，记录错误但不在控制台显示用户内容（避免泄露敏感信息）
    console.warn('Markdown渲染出错:', error);
    
    // 降级处理：使用纯文本显示，保持基本的换行格式
    const fallbackContent = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/\n/g, '<br/>');
    
    return (
      <Typography>
        <div 
          dangerouslySetInnerHTML={{ __html: fallbackContent }}
          style={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}
        />
      </Typography>
    );
  }
};



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
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
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
  const [loading, setLoading] = useState<boolean>(true);

  // 加载会话列表
  const loadSessionList = async () => {
    try {
      setLoading(true);
      const sessions = await getSessionList();
      const conversationItems = sessions.map(convertSessionToConversation);
      setConversations(conversationItems);
      
      // 如果有会话且当前没有选中的会话，选中第一个
      if (conversationItems.length > 0 && !selectedId) {
        setSelectedId(conversationItems[0].key);
      }
    } catch (error) {
      console.error('加载会话列表失败:', error);
      antdMessage.error('加载会话列表失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载时加载会话列表
  useEffect(() => {
    loadSessionList();
  }, []);

  // 自动滚动到底部的函数
  const scrollToBottom = (force = false, smooth = false) => {
    if (bubbleListRef.current && (!isUserScrolling || force)) {
      const container = bubbleListRef.current;
      if (smooth) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        });
      } else {
        container.scrollTop = container.scrollHeight;
      }
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
  const searchMenu = {
    items: [
      {
        key: "web",
        icon: <GlobalOutlined />,
        label: "Web搜索",
        onClick: () => setSearchMode("web")
      },
      {
        key: "kb",
        icon: <DatabaseOutlined />,
        label: "知识库检索",
        onClick: () => setSearchMode("kb")
      }
    ]
  };

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
  const handleDeleteConversation = async (key: string) => {
    if (conversations.length <= 1) {
      antdMessage.warning("至少需要保留一个会话");
      return;
    }
    
    // 获取要删除的会话名称
    const conversationToDelete = conversations.find(conv => conv.key === key);
    const conversationName = conversationToDelete?.label || '该会话';
    
    // 使用Ant Design的Modal.confirm
    Modal.confirm({
      title: '删除会话',
      content: `确定要删除会话 "${conversationName}" 吗？删除后无法恢复。`,
      okText: '确定删除',
      cancelText: '取消',
      okType: 'danger',
      centered: true,
      maskClosable: true,
      width: 400,
      style: {
        top: '30%',
      },
      styles: {
        body: {
          padding: '24px',
        },
      },
      onOk: async () => {
        try {
          // 调用删除会话API
          await deleteSession(key);
          
          // 刷新会话列表
          await loadSessionList();
          
          // 如果删除的是当前选中的会话，切换到新建会话状态
          if (selectedId === key) {
            // 重置到新建会话状态
            setSelectedId('');
            setSessionId(null);
            setMessages([]);
            setHasStarted(false);
          }
          
          antdMessage.success("会话已删除");
        } catch (error) {
          console.error('删除会话失败:', error);
          antdMessage.error('删除会话失败: ' + (error instanceof Error ? error.message : '未知错误'));
        }
      },
    });
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
        '更早': 5,
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

  // 新建对话逻辑：切换到初始聊天状态
  const handleAddConversation = () => {
    // 清除当前选中的会话
    setSelectedId('');
    // 切换到初始状态（Sender在中间）
    setHasStarted(false);
    // 清除会话ID和消息
    setSessionId(null);
    setMessages([]);
  };

  // 发送消息
  const handleSubmit = async (message: string) => {
    // 如果还没有开始对话，设置为已开始状态
    if (!hasStarted) {
      setHasStarted(true);
    }
    
    // 标记是否是新创建的会话（用于决定是否需要刷新会话列表）
    let isNewSession = false;
    
    // 如果还没有会话ID，则创建一个新会话
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      try {
        currentSessionId = await createSession();
        setSessionId(currentSessionId);
        isNewSession = true;
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

      // 如果是新创建的会话，在开始流式聊天前刷新会话列表
      if (isNewSession) {
        try {
          await loadSessionList();
          // 选中新创建的会话
          setSelectedId(currentSessionId);
        } catch (error) {
          console.warn('刷新会话列表失败:', error);
        }
      }

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
          
          // 如果是新创建的会话，在SSE数据全部返回后再次刷新会话列表
          if (isNewSession) {
            try {
              await loadSessionList();
            } catch (error) {
              console.warn('SSE完成后刷新会话列表失败:', error);
            }
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
              
              // 流式更新消息内容
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
                  style={BOLD_BUTTON_STYLE}
                  onClick={handleAddConversation}
                >
                  新建对话
                </Button>
                <Button
                  type="text"
                  icon={<SettingOutlined />}
                  style={BOLD_BUTTON_STYLE}
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
              {(() => {
                if (loading) {
                  return (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                      <Spin size="small" />
                      <div style={{ marginTop: '8px', color: '#666' }}>加载中...</div>
                    </div>
                  );
                }
                
                if (conversations.length === 0) {
                  return (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
                      <CommentOutlined style={{ fontSize: '32px', marginBottom: '12px', display: 'block' }} />
                      <div style={{ fontSize: '14px', marginBottom: '8px' }}>暂无会话</div>
                      <div style={{ fontSize: '12px' }}>点击上方 + 按钮创建新会话</div>
                    </div>
                  );
                }
                
                return (
                <Conversations
                  style={{ width: "100%", color: "#222" }}
                  items={conversations}
                  activeKey={selectedId}
                  onActiveChange={async (key) => {
                    try {
                      setSelectedId(key);
                      setSessionId(key); // 切换会话时设置sessionId为选中的会话ID
                      setHasStarted(true);
                      
                      // 加载该会话的历史消息
                      const historyMessages = await loadSessionMessages(key);
                      setMessages(historyMessages);
                      
                      // 重置用户滚动状态，允许自动滚动
                      setIsUserScrolling(false);
                      
                      // 使用requestAnimationFrame确保DOM更新后再滚动，避免闪烁
                       requestAnimationFrame(() => {
                         requestAnimationFrame(() => {
                           scrollToBottom(true, true); // 使用平滑滚动
                         });
                       });
                    } catch (error) {
                      console.error('切换会话失败:', error);
                      antdMessage.error('切换会话失败，请重试');
                      setMessages([]); // 出错时清空消息
                      setHasStarted(false);
                    }
                  }}
                  menu={conversationMenu}
                  groupable={groupable}
                />
                );
              })()}
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
                          menu={searchMenu}
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
                                fontSize: ICON_SIZE,
                              }}
                              />
                            }
                            style={{
                              fontSize: ICON_SIZE,
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
                                  fontSize: ICON_SIZE,
                                }}
                            />
                          }
                          style={{
                              fontSize: ICON_SIZE,
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
                                style={{ fontSize: ICON_SIZE }}
                              />
                            }
                            style={{ fontSize: BUTTON_SIZE, color: token.colorText }}
                          />
                        </Upload>
                        <Divider type="vertical" />
                        <SpeechButton style={{ fontSize: ICON_SIZE, color: token.colorText }} />
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
                        style: USER_AVATAR_STYLE
                      },
                      className: 'user-bubble'
                    },
                    assistant: {
                      placement: 'start',
                      messageRender: (content) => renderMarkdown(content as string),
                      avatar: {
                        icon: <RobotOutlined />,
                        style: ASSISTANT_AVATAR_STYLE
                      },
                      className: 'assistant-bubble'
                    },
                  }}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
            <div style={{ 
              flexShrink: 0, // 防止在flex布局中被压缩
              padding: "16px 0",
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
                            menu={searchMenu}
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
                                fontSize: ICON_SIZE,
                              }}
                                />
                              }
                              style={{
                              fontSize: ICON_SIZE,
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
                                  fontSize: ICON_SIZE,
                                }}
                              />
                            }
                            style={{
                              fontSize: ICON_SIZE,
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
                                  style={{ fontSize: ICON_SIZE }}
                                />
                              }
                              style={{ fontSize: BUTTON_SIZE, color: token.colorText }}
                            />
                          </Upload>
                          <Divider type="vertical" />
                          <SpeechButton style={{ fontSize: ICON_SIZE, color: token.colorText }} />
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
        destroyOnHidden
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
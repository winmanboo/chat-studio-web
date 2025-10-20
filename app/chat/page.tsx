"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  ConversationsProps,
} from "@ant-design/x";

import ModelSelectButton from "@/components/ModelSelectButton";
import {
  EditOutlined,
  DeleteOutlined,
  CommentOutlined,
} from "@ant-design/icons";
import {
  message as antdMessage,
  Modal,
  Input,
  Space,
} from "antd";
import {
  createSession,
  chatStream,
  ChatRequest,
  getSessionList,
  SessionItem,
  getSessionMessages,
  SessionMessage,
  deleteSession,
  updateSessionTitle,
} from "@/lib/api/conversations";
import SessionManageModal from "@/components/SessionManageModal";
import KnowledgeBaseSelectModal from "@/components/KnowledgeBaseSelectModal";
import ModelSelectModal from "@/components/ModelSelectModal";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatMessageInput from "@/components/chat/ChatMessageInput";
import ChatMessageList from "@/components/chat/ChatMessageList";
import { KnowledgeBase } from "@/lib/api/knowledgebase";
import {
  getDefaultModel,
  DefaultModel,
  ModelListItem,
  setDefaultModel as setDefaultModelAPI,
} from "@/lib/api/models";
import { loginEventManager } from "@/lib/events/loginEvents";
import { modelEventManager } from "@/lib/events/modelEvents";

// 样式常量

// Sender容器3D样式常量
const SENDER_CONTAINER_STYLE = {
  borderRadius: "16px",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)",
  border: "1px solid rgba(255, 255, 255, 0.8)",
  backdropFilter: "blur(10px)",
  transition: "all 0.3s ease",
};

// Chat Studio标题样式
const CHAT_STUDIO_TITLE_STYLE = {
  fontSize: 40,
  fontWeight: 700,
  color: "#222",
  letterSpacing: 2,
  textAlign: "center" as const,
  marginBottom: "40px",
};

// 中心容器样式
const CENTER_CONTAINER_STYLE = {
  width: "100%",
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center",
  justifyContent: "center",
  flex: 1,
  position: "relative" as const,
};

// 中间Sender容器样式
const MIDDLE_SENDER_CONTAINER_STYLE = {
  width: "54%",
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center",
  justifyContent: "center",
  ...SENDER_CONTAINER_STYLE,
};

// 底部Sender容器样式
const BOTTOM_SENDER_CONTAINER_STYLE = {
  width: "80%",
  margin: "0 auto",
  display: "flex",
  justifyContent: "center",
  ...SENDER_CONTAINER_STYLE,
};

// 模型选择组件的绝对定位样式
const MODEL_SELECT_BUTTON_CONTAINER_STYLE = {
  position: "absolute" as const,
  top: "10px",
  left: "10px",
  zIndex: 10,
};

// 时间分组函数
const getTimeGroup = (timestamp: number): string => {
  const now = new Date();

  // 获取今天0点的时间戳
  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime();
  // 获取昨天0点的时间戳
  const yesterdayStart = todayStart - 24 * 60 * 60 * 1000;
  // 获取三天前0点的时间戳
  const threeDaysAgoStart = todayStart - 3 * 24 * 60 * 60 * 1000;
  // 获取一周前0点的时间戳
  const oneWeekAgoStart = todayStart - 7 * 24 * 60 * 60 * 1000;
  // 获取一个月前0点的时间戳
  const oneMonthAgoStart = todayStart - 30 * 24 * 60 * 60 * 1000;

  if (timestamp >= todayStart) {
    return "今天";
  } else if (timestamp >= yesterdayStart) {
    return "昨天";
  } else if (timestamp >= threeDaysAgoStart) {
    return "三天前";
  } else if (timestamp >= oneWeekAgoStart) {
    return "一周前";
  } else if (timestamp >= oneMonthAgoStart) {
    return "一个月前";
  } else {
    return "更早";
  }
};

// 将API数据转换为组件所需格式
const convertSessionToConversation = (
  session: SessionItem
): ConversationItem => {
  return {
    key: session.sessionId,
    label: session.sessionTitle,
    icon: "💬", // 默认图标
    group: getTimeGroup(session.createdAt),
  };
};

// 将API消息转换为组件消息格式
const convertSessionMessageToChatMessage = (
  sessionMessage: SessionMessage
): ChatMessage => {
  const chatMessage: ChatMessage = {
    content: sessionMessage.message,
    role: sessionMessage.messageType === "USER" ? "user" : "assistant",
    avatar: sessionMessage.messageType === "USER" ? "👤" : "🤖",
  };

  // 如果是AI消息且包含thinking内容，添加thinking字段
  if (sessionMessage.messageType === "ASSISTANT" && sessionMessage.thinking) {
    chatMessage.thinking = sessionMessage.thinking;
  }

  // 如果是AI消息且包含检索结果，添加检索相关数据
  if (
    sessionMessage.messageType === "ASSISTANT" &&
    sessionMessage.kbName &&
    sessionMessage.retrieves
  ) {
    chatMessage.retrieveMode = true;
    chatMessage.kbName = sessionMessage.kbName;
    chatMessage.retrieves = sessionMessage.retrieves;
  }

  return chatMessage;
};

// 加载会话消息
const loadSessionMessages = async (
  sessionId: string
): Promise<ChatMessage[]> => {
  try {
    const sessionMessages = await getSessionMessages(sessionId);
    // 按照parentId关系排序消息，确保消息顺序正确
    const sortedMessages = sessionMessages.sort((a, b) => a.id - b.id);
    return sortedMessages.map(convertSessionMessageToChatMessage);
  } catch (error) {
    console.error("加载会话消息失败:", error);
    throw error;
  }
};

// 检索结果类型定义
interface RetrieveResult {
  chunkIndexs: string[];
  docId: string;
  kbId: number;
  title: string;
}

// 聊天消息类型定义
interface ChatMessage {
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
  const [selectedId, setSelectedId] = useState<string>("");
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const bubbleListRef = useRef<HTMLDivElement>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [editingConversation, setEditingConversation] = useState<{
    key: string;
    label: string;
  } | null>(null);
  const [newConversationName, setNewConversationName] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null); // 用于存储会话ID
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState(""); // 用于控制Sender输入框的值
  const senderRef = useRef<HTMLDivElement>(null);
  const [senderHeight, setSenderHeight] = useState(100); // 跟踪Sender高度

  // 检索模式
  const [searchMode, setSearchMode] = useState<null | "web" | "kb">(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [sessionManageModalVisible, setSessionManageModalVisible] =
    useState<boolean>(false);
  const [kbSelectModalVisible, setKbSelectModalVisible] =
    useState<boolean>(false);
  const [selectedKb, setSelectedKb] = useState<KnowledgeBase | null>(null);
  const [modelSelectModalVisible, setModelSelectModalVisible] =
    useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<ModelListItem | null>(
    null
  );
  const [defaultModel, setDefaultModel] = useState<DefaultModel | null>(null);

  // 加载会话列表
  const loadSessionList = async () => {
    try {
      setLoading(true);
      const sessions = await getSessionList();
      const conversationItems = sessions.map(convertSessionToConversation);
      setConversations(conversationItems);
    } catch (error) {
      console.error("加载会话列表失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 加载默认模型
  const loadDefaultModel = async () => {
    try {
      const model = await getDefaultModel();
      setDefaultModel(model);
    } catch (error) {
      console.error("加载默认模型失败:", error);
    }
  };

  // 设置默认模型
  const handleSetDefaultModel = async () => {
    if (!selectedModel) {
      antdMessage.warning("请先选择一个模型");
      return;
    }

    try {
      await setDefaultModelAPI(selectedModel.id);
      antdMessage.success("设置默认模型成功");
      // 重新加载默认模型信息
      await loadDefaultModel();
      // 触发模型变更事件，通知其他组件刷新
      modelEventManager.triggerModelChange();
    } catch (error) {
      console.error("设置默认模型失败:", error);
      antdMessage.error("设置默认模型失败");
    }
  };

  // 组件挂载时加载会话列表和默认模型
  useEffect(() => {
    loadSessionList();
    loadDefaultModel();
  }, []);

  // 监听登录成功事件，自动刷新会话列表和默认模型
  useEffect(() => {
    const unsubscribe = loginEventManager.onLoginSuccess(() => {
      loadSessionList();
      loadDefaultModel();
    });

    // 组件卸载时取消订阅
    return unsubscribe;
  }, []);

  // 监听模型变更事件，自动刷新默认模型
  useEffect(() => {
    const unsubscribe = modelEventManager.onModelChange(() => {
      loadDefaultModel();
    });

    // 组件卸载时取消订阅
    return unsubscribe;
  }, []);

  // 监听Sender高度变化
  useEffect(() => {
    if (!senderRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setSenderHeight(entry.contentRect.height);
      }
    });

    resizeObserver.observe(senderRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [hasStarted]);

  // 自动滚动到底部的函数
  const scrollToBottom = (force = false, smooth = false) => {
    if (bubbleListRef.current && (!isUserScrolling || force)) {
      const container = bubbleListRef.current;
      if (smooth) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: "smooth",
        });
      } else {
        container.scrollTop = container.scrollHeight;
      }
    }
  };

  // 监听消息变化，自动滚动到底部
  useEffect(() => {
    scrollToBottom(true); // 强制滚动到底部，不管用户是否在滚动
  }, [messages]);

  // 监听用户滚动行为
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const isAtBottom =
      container.scrollHeight - container.scrollTop <=
      container.clientHeight + 50;
    setIsUserScrolling(!isAtBottom);
  };



  // 修改会话名称
  const handleEditConversation = (key: string, currentLabel: string) => {
    setEditingConversation({ key, label: currentLabel });
    setNewConversationName(currentLabel);
  };

  // 确认修改会话名称
  const confirmEditConversation = async () => {
    if (editingConversation && newConversationName.trim()) {
      try {
        // 调用API更新会话标题
        await updateSessionTitle(editingConversation.key, newConversationName.trim());
        
        // 更新本地状态
        setConversations((prev) =>
          prev.map((conv) =>
            conv.key === editingConversation.key
              ? { ...conv, label: newConversationName.trim() }
              : conv
          )
        );
        
        antdMessage.success("会话名称已更新");
        setEditingConversation(null);
        setNewConversationName("");
      } catch (error) {
        console.error("更新会话名称失败:", error);
        antdMessage.error("更新会话名称失败: " + (error instanceof Error ? error.message : "未知错误"));
      }
    }
  };

  // 删除会话
  const handleDeleteConversation = async (key: string) => {
    // 获取要删除的会话名称
    const conversationToDelete = conversations.find((conv) => conv.key === key);
    const conversationName = conversationToDelete?.label || "该会话";

    // 使用Ant Design的Modal.confirm
    Modal.confirm({
      title: "删除会话",
      content: `确定要删除会话 "${conversationName}" 吗？删除后无法恢复。`,
      okText: "确定删除",
      cancelText: "取消",
      okType: "danger",
      centered: true,
      maskClosable: true,
      width: 400,
      styles: {
        body: {
          padding: "24px",
        },
      },
      onOk: async () => {
        try {
          // 调用删除会话API，传递单个sessionId
          await deleteSession(key);

          // 刷新会话列表
          await loadSessionList();

          // 如果删除的是当前选中的会话，切换到新建会话状态
          if (selectedId === key) {
            // 重置到新建会话状态
            setSelectedId("");
            setSessionId(null);
            setMessages([]);
            setHasStarted(false);
          }

          antdMessage.success("会话已删除");
        } catch (error) {
          console.error("删除会话失败:", error);
          antdMessage.error(
            "删除会话失败: " +
              (error instanceof Error ? error.message : "未知错误")
          );
        }
      },
    });
  };

  // 为Conversations组件创建菜单项
  const conversationMenu: ConversationsProps["menu"] = (item) => ({
    items: [
      {
        label: "修改名称",
        key: "edit",
        icon: <EditOutlined />,
      },
      {
        label: "删除会话",
        key: "delete",
        icon: <DeleteOutlined />,
        danger: true,
      },
    ],
    onClick: (menuInfo) => {
      menuInfo.domEvent.stopPropagation();
      if (menuInfo.key === "edit") {
        handleEditConversation(item.key, String(item.label || ""));
      } else if (menuInfo.key === "delete") {
        handleDeleteConversation(item.key);
      }
    },
  });

  // 分组排序和标题自定义
  const groupable: ConversationsProps["groupable"] = {
    sort: (a: string, b: string): number => {
      // 定义分组的顺序
      const groupOrder: Record<string, number> = {
        今天: 0,
        昨天: 1,
        三天前: 2,
        一周前: 3,
        一个月前: 4,
        更早: 5,
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
    setSelectedId("");
    // 切换到初始状态（Sender在中间）
    setHasStarted(false);
    // 清除会话ID和消息
    setSessionId(null);
    setMessages([]);
    // 重置Sender状态
    setInputValue(""); // 清空输入框内容
    setSearchMode(null); // 重置检索模式
    setSelectedKb(null); // 清除选中的知识库
  };

  // 处理知识库选择
  const handleKbSelect = (kb: KnowledgeBase) => {
    setSelectedKb(kb);
    setSearchMode("kb");
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
        const errorMessage =
          error instanceof Error ? error.message : "未知错误";
        antdMessage.error("创建会话失败: " + errorMessage);
        return;
      }
    }

    const userMessage: ChatMessage = {
      content: message,
      role: "user",
      avatar: "👤",
    };
    const aiMessage: ChatMessage = {
      content: "",
      role: "assistant",
      avatar: "🤖",
      isLoading: true,
      displayContent: "",
    };

    // 添加用户消息和AI回复占位符
    setMessages((prev) => [...prev, userMessage, aiMessage]);

    try {
      // 确定要使用的模型信息
      const modelToUse = selectedModel || defaultModel;

      // 准备请求参数
      const requestData: ChatRequest = {
        sessionId: currentSessionId, // 直接使用currentSessionId，确保它是有效的
        prompt: message,
        ...(modelToUse?.providerId && { providerId: modelToUse.providerId }),
        ...(modelToUse?.modelName && { modelName: modelToUse.modelName }),
        searchEnabled: searchMode === "web",
        ragEnabled: searchMode === "kb",
        ...(searchMode === "kb" && selectedKb && { kbId: selectedKb.id }),
      };

      // 如果是新创建的会话，在开始流式聊天前刷新会话列表
      if (isNewSession) {
        try {
          await loadSessionList();
          // 选中新创建的会话
          setSelectedId(currentSessionId);
        } catch (error) {
          console.warn("刷新会话列表失败:", error);
        }
      }

      // 发起流式请求（现在在API层处理）
      const reader = await chatStream(requestData);

      const decoder = new TextDecoder();

      let fullContent = "";
      const messageIndex = messages.length + 1; // AI消息的索引

      // 更新AI消息为加载状态
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[messageIndex] = {
          ...newMessages[messageIndex],
          isLoading: false,
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
            const lines = accumulatedData.split("\n");
            for (const line of lines) {
              if (line.startsWith("data:")) {
                // 提取data:后面的内容
                const data = line.slice(5).trim();
                if (data !== "[DONE]") {
                  try {
                    // 尝试解析JSON数据
                    const jsonData = JSON.parse(data);

                    // 处理检索模式的响应
                    if (jsonData.retrieveMode === true) {
                      // 这是检索结果，更新消息的检索信息
                      setMessages((prev) => {
                        const newMessages = [...prev];
                        newMessages[messageIndex] = {
                          ...newMessages[messageIndex],
                          retrieveMode: true,
                          kbName: jsonData.kbName,
                          retrieves: jsonData.retrieves,
                        };
                        return newMessages;
                      });
                    } else if (jsonData.content) {
                      fullContent += jsonData.content;
                    }
                  } catch {
                    // 如果不是有效的JSON，直接使用原始数据
                    fullContent += data;
                  }
                }
              }
            }

            setMessages((prev) => {
              const newMessages = [...prev];
              newMessages[messageIndex] = {
                ...newMessages[messageIndex],
                content: fullContent,
                displayContent: fullContent,
              };
              return newMessages;
            });
          }

          // 如果是新创建的会话，在SSE数据全部返回后再次刷新会话列表
          if (isNewSession) {
            try {
              await loadSessionList();
            } catch (error) {
              console.warn("SSE完成后刷新会话列表失败:", error);
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
          if (line.startsWith("data:")) {
            // 提取data:后面的内容
            const data = line.slice(5).trim();
            if (data !== "[DONE]") {
              try {
                // 尝试解析JSON数据
                const jsonData = JSON.parse(data);

                // 处理检索模式的响应
                if (jsonData.retrieveMode === true) {
                  // 这是检索结果，只在第一个响应中出现
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    newMessages[messageIndex] = {
                      ...newMessages[messageIndex],
                      retrieveMode: true,
                      kbName: jsonData.kbName,
                      retrieves: jsonData.retrieves,
                      content: fullContent,
                      displayContent: fullContent,
                    };
                    return newMessages;
                  });
                } else if (jsonData.content) {
                  // 这是普通的内容响应
                  fullContent += jsonData.content;

                  // 流式更新消息内容
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    newMessages[messageIndex] = {
                      ...newMessages[messageIndex],
                      content: fullContent,
                      displayContent: fullContent,
                    };
                    return newMessages;
                  });
                }
              } catch {
                // 如果不是有效的JSON，直接使用原始数据
                fullContent += data;

                // 流式更新消息内容
                setMessages((prev) => {
                  const newMessages = [...prev];
                  newMessages[messageIndex] = {
                    ...newMessages[messageIndex],
                    content: fullContent,
                    displayContent: fullContent,
                  };
                  return newMessages;
                });
              }
            }
          }
        }
      }
    } catch (error: unknown) {
      console.error("消息发送失败:", error); // 在控制台输出详细错误信息
      const errorMessage = error instanceof Error ? error.message : "未知错误";
      antdMessage.error("消息发送失败: " + errorMessage);
      // 更新AI消息状态为错误
      setMessages((prev) =>
        prev.map((msg, idx) =>
          idx === prev.length - 1
            ? {
                ...msg,
                isLoading: false,
                content: "抱歉，消息发送失败，请稍后重试。",
              }
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
      <ChatSidebar
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        conversations={conversations}
        selectedId={selectedId}
        loading={loading}
        onAddConversation={handleAddConversation}
        onSettingsClick={() => setSessionManageModalVisible(true)}
        onConversationSelect={async (key) => {
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
            console.error("切换会话失败:", error);
            antdMessage.error("切换会话失败，请重试");
            setMessages([]); // 出错时清空消息
            setHasStarted(false);
          }
        }}
        conversationMenu={conversationMenu}
        groupable={groupable}
      />
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
          <div style={CENTER_CONTAINER_STYLE}>
            {/* 模型选择按钮 - 初始状态，置于左上角 */}
            <div style={MODEL_SELECT_BUTTON_CONTAINER_STYLE}>
              <ModelSelectButton
                selectedModel={selectedModel}
                defaultModel={defaultModel}
                onModelSelectClick={() => setModelSelectModalVisible(true)}
                onSetDefaultClick={() => {
                  handleSetDefaultModel();
                }}
                showSetDefault={true}
              />
            </div>

            <div style={CHAT_STUDIO_TITLE_STYLE}>Chat Studio</div>
            <div style={MIDDLE_SENDER_CONTAINER_STYLE}>
              <ChatMessageInput
                value={inputValue}
                onChange={setInputValue}
                onSubmit={(val) => {
                  handleSubmit(val);
                  setInputValue(""); // 提交后清空输入框
                }}
                searchMode={searchMode}
                selectedKb={selectedKb}
                onSearchModeChange={setSearchMode}
                onKbSelectModalOpen={() => setKbSelectModalVisible(true)}
                placeholder="请输入内容并回车..."
              />
            </div>
          </div>
        ) : (
          <div
            style={{
              position: "relative",
              height: "100%",
              overflow: "hidden",
            }}
          >
            {/* 模型选择按钮 - 聊天状态 */}
            <div style={MODEL_SELECT_BUTTON_CONTAINER_STYLE}>
              <ModelSelectButton
                selectedModel={selectedModel}
                defaultModel={defaultModel}
                onModelSelectClick={() => setModelSelectModalVisible(true)}
                onSetDefaultClick={() => {
                  handleSetDefaultModel();
                }}
                showSetDefault={false}
              />
            </div>

            {/* BubbleList 区域 */}
            <div
              ref={bubbleListRef}
              onScroll={handleScroll}
              style={{
                position: "absolute",
                top: "40px", // 增加顶部间距为模型选择按钮留出空间
                left: 0,
                right: 0,
                bottom: `${senderHeight + 30}px`, // 动态调整为Sender的实际高度并增加底部间距
                overflow: "auto",
                padding: "0 10%", // 使用padding控制内容宽度，与Sender的80%宽度对应
              }}
            >
              <ChatMessageList 
                messages={messages} 
                isViewingHistory={!!selectedId} // 如果有选中的会话ID，说明在查看历史消息
              />
            </div>
            {/* Sender 组件 - 绝对定位固定在底部 */}
            <div
              ref={senderRef}
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: "20px",
                display: "flex",
                justifyContent: "center",
                zIndex: 10,
              }}
            >
              <div style={BOTTOM_SENDER_CONTAINER_STYLE}>
                <ChatMessageInput
                  value={inputValue}
                  onChange={setInputValue}
                  onSubmit={(val) => {
                    handleSubmit(val);
                    setInputValue(""); // 提交后清空输入框
                  }}
                  searchMode={searchMode}
                  selectedKb={selectedKb}
                  onSearchModeChange={setSearchMode}
                  onKbSelectModalOpen={() => setKbSelectModalVisible(true)}
                  placeholder="请输入内容并回车..."
                />
              </div>
            </div>
          </div>
        )}
      </div>
      {/* 编辑会话名称的模态框 */}
      <Modal
        title="修改会话名称"
        open={!!editingConversation}
        onOk={confirmEditConversation}
        onCancel={() => setEditingConversation(null)}
        destroyOnHidden
        centered
      >
        <Input
          value={newConversationName}
          onChange={(e) => setNewConversationName(e.target.value)}
          onPressEnter={confirmEditConversation}
          placeholder="请输入会话名称"
        />
      </Modal>

      {/* 会话管理模态框 */}
      <SessionManageModal
        open={sessionManageModalVisible}
        onCancel={() => setSessionManageModalVisible(false)}
        onSessionsChange={loadSessionList}
        selectedSessionId={selectedId}
        onSelectedSessionDeleted={() => {
          // 当前选中的会话被删除时，重置到新建会话状态
          setSelectedId("");
          setSessionId(null);
          setMessages([]);
          setHasStarted(false);
        }}
      />

      {/* 知识库选择模态框 */}
      <KnowledgeBaseSelectModal
        open={kbSelectModalVisible}
        onCancel={() => setKbSelectModalVisible(false)}
        onSelect={handleKbSelect}
      />

      {/* 模型选择模态框 */}
      <ModelSelectModal
        open={modelSelectModalVisible}
        onCancel={() => setModelSelectModalVisible(false)}
        onSelect={(model) => {
          setSelectedModel(model);
          setModelSelectModalVisible(false);
        }}
        selectedModel={selectedModel}
      />
    </div>
  );
};

export default ChatPage;

"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ConversationsProps } from "@ant-design/x";

import ModelSelectButton from "@/components/ModelSelectButton";
import {
  EditOutlined,
  DeleteOutlined,
  CommentOutlined,
} from "@ant-design/icons";
import { message as antdMessage, Modal, Input, Space, Splitter } from "antd";
import {
  getSessionList,
  SessionItem,
  getSessionMessages,
  SessionMessage,
  deleteSession,
  updateSessionTitle,
} from "@/lib/api/conversations";
import SessionManageModal from "@/components/SessionManageModal";
import KnowledgeBaseSelectModal from "@/components/KnowledgeBaseSelectModal";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatMessageInput from "@/components/chat/ChatMessageInput";
import ChatMessageList, { ChatMessage } from "@/components/chat/ChatMessageList";
import AnimatedTitle from "@/components/chat/AnimatedTitle";
import PreviewPanel from "@/components/chat/PreviewPanel";
import { KnowledgeBase } from "@/lib/api/knowledgebase";
import {
  getDefaultModel,
  DefaultModel,
  ModelListItem,
  setDefaultModel as setDefaultModelAPI,
  ModelProviderWithModels,
  getModelList,
} from "@/lib/api/models";
import { loginEventManager } from "@/lib/events/loginEvents";
import { modelEventManager } from "@/lib/events/modelEvents";
import { useChat } from "@/lib/hooks/useChat";

import styles from "./page.module.css";

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
    group: getTimeGroup(session.updatedAt),
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
    modelName: sessionMessage.modelName,
  };

  // 如果是USER消息且包含content字段，添加文件相关信息
  if (sessionMessage.messageType === "USER" && sessionMessage.content) {
    chatMessage.fileUrl = sessionMessage.content.content;
    chatMessage.contentType = sessionMessage.content.contentType;
  }

  // 如果是AI消息且包含thinking内容，添加thinking字段
  if (sessionMessage.messageType === "ASSISTANT" && sessionMessage.thinking) {
    chatMessage.thinking = sessionMessage.thinking;
  }

  // 如果是AI消息且包含检索结果，添加检索相关数据
  if (
    sessionMessage.messageType === "ASSISTANT" &&
    sessionMessage.retrieves &&
    sessionMessage.retrieves.length > 0
  ) {
    chatMessage.retrieveMode = true;
    chatMessage.kbName = sessionMessage.kbName;
    chatMessage.retrieves = sessionMessage.retrieves;
  }

  // 如果是AI消息且包含工具调用信息，添加toolNames字段
  if (
    sessionMessage.messageType === "ASSISTANT" &&
    sessionMessage.toolNames &&
    sessionMessage.toolNames.length > 0
  ) {
    chatMessage.toolNames = sessionMessage.toolNames;
  }

  return chatMessage;
};

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
  const [hasStarted, setHasStarted] = useState(false);
  const [editingConversation, setEditingConversation] = useState<{
    key: string;
    label: string;
  } | null>(null);
  const [newConversationName, setNewConversationName] = useState("");
  
  // 用于控制Sender输入框的值
  const [inputValue, setInputValue] = useState(""); 
  
  // 检索模式
  const [searchMode, setSearchMode] = useState<null | "web"| 'think' | "kb">(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  const [sessionManageModalVisible, setSessionManageModalVisible] =
    useState<boolean>(false);
  const [kbSelectModalVisible, setKbSelectModalVisible] =
    useState<boolean>(false);
  const [selectedKb, setSelectedKb] = useState<KnowledgeBase | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelListItem | null>(
    null
  );
  const [defaultModel, setDefaultModel] = useState<DefaultModel | null>(null);
  const [modelList, setModelList] = useState<ModelProviderWithModels[]>([]);

  // 预览相关状态
  const [previewContent, setPreviewContent] = useState<string>("");
  const [previewVisible, setPreviewVisible] = useState(false);

  // 处理预览
  const handlePreview = useCallback((content: string) => {
    setPreviewContent(content);
    setPreviewVisible(true);
  }, []);

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

  // 使用自定义 Hook 管理聊天逻辑
  const {
    messages,
    setMessages,
    sessionId,
    setSessionId,
    sendingLoading,
    handleSubmit,
    handleCancel,
  } = useChat({
    initialSessionId: null,
    onSessionCreated: async (newSessionId) => {
      try {
        await loadSessionList();
        setSelectedId(newSessionId);
      } catch (error) {
        console.warn("刷新会话列表失败:", error);
      }
    },
  });

  // 转换消息列表，使用useMemo优化性能
  const displayMessages = useMemo(() => {
    return messages.map(m => m.message);
  }, [messages]);

  // 加载会话消息
  const loadSessionMessages = async (sessionId: string) => {
    try {
      const sessionMessages = await getSessionMessages(sessionId);
      // 按照parentId关系排序消息，确保消息顺序正确
      const sortedMessages = sessionMessages.sort((a, b) => a.id - b.id);
      
      // useXChat 需要 MessageInfo<T> 格式
      const messageInfos = sortedMessages.map(msg => ({
        id: msg.id.toString(),
        message: convertSessionMessageToChatMessage(msg),
        status: 'success' as const
      }));
      
      setMessages(messageInfos);
      return sortedMessages.map(convertSessionMessageToChatMessage);
    } catch (error) {
      console.error("加载会话消息失败:", error);
      throw error;
    }
  };

  // 加载模型列表
  const loadModelList = async () => {
    try {
      const list = await getModelList();
      setModelList(list);
    } catch (error) {
      console.error("加载模型列表失败:", error);
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
    loadModelList();
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

  // 监听模型变更事件，自动刷新默认模型和模型列表
  useEffect(() => {
    const unsubscribe = modelEventManager.onModelChange(() => {
      loadDefaultModel();
      loadModelList();
    });

    // 组件卸载时取消订阅
    return unsubscribe;
  }, []);


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
        await updateSessionTitle(
          editingConversation.key,
          newConversationName.trim()
        );

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
        antdMessage.error(
          "更新会话名称失败: " +
            (error instanceof Error ? error.message : "未知错误")
        );
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
      className: styles.confirmModal,
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
    label: (group: string) =>
      group ? (
        <Space>
          <CommentOutlined />
          <span>{group}</span>
        </Space>
      ) : null,
    collapsible: true,
    defaultExpandedKeys: ['今天']
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
    setPreviewVisible(false); // 关闭预览面板
  };

  // 处理知识库选择
  const handleKbSelect = (kb: KnowledgeBase) => {
    setSelectedKb(kb);
    setSearchMode("kb");
  };

  // 发送消息的包装函数
  const onSendMessage = (val: string, uploadId?: string, contentType?: string, fileUrl?: string) => {
    if (!hasStarted) {
        setHasStarted(true);
    }
    handleSubmit(val, selectedModel || defaultModel, searchMode, selectedKb, uploadId, contentType, fileUrl);
    setInputValue(""); // 提交后清空输入框
  };

  return (
    <div className={styles.pageContainer}>
      {/* 左侧对话管理区 */}
      <ChatSidebar
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        conversations={conversations}
        selectedId={selectedId}
        loading={loading}
        onSettingsClick={() => setSessionManageModalVisible(true)}
        onConversationSelect={async (key) => {
          try {
            setSelectedId(key);
            setSessionId(key); // 切换会话时设置sessionId为选中的会话ID
            setHasStarted(true);
            setPreviewVisible(false); // 关闭预览面板

            // 加载该会话的历史消息
            await loadSessionMessages(key);

          } catch (error) {
            console.error("切换会话失败:", error);
            antdMessage.error("切换会话失败，请重试");
            setMessages([]); // 出错时清空消息
            setHasStarted(false);
          }
        }}
        conversationMenu={conversationMenu}
        groupable={groupable}
        onAddConversation={handleAddConversation}
      />
      {/* 右侧聊天区 */}
      <div className={styles.chatArea}>
        <div className={styles.modelSelectContainer}>
          <ModelSelectButton
              selectedModel={selectedModel}
              defaultModel={defaultModel}
              onSetDefaultClick={() => {
                handleSetDefaultModel();
              }}
              showSetDefault={true}
              modelList={modelList}
              onModelSelect={setSelectedModel}
              onDropdownOpen={loadModelList}
            />
        </div>
        {!hasStarted ? (
          <div className={styles.centerContainer}>
            <AnimatedTitle
              className={styles.title}
            />
            <div className={styles.middleSenderContainer}>
              <ChatMessageInput
                value={inputValue}
                onChange={setInputValue}
                onSubmit={onSendMessage}
                loading={sendingLoading}
                onCancel={handleCancel}
                searchMode={searchMode}
                selectedKb={selectedKb}
                onSearchModeChange={setSearchMode}
                onKbSelectModalOpen={() => setKbSelectModalVisible(true)}
                selectedModelAbilities={selectedModel?.abilities || defaultModel?.abilities}
              />
            </div>
          </div>
        ) : (
          <div className={styles.chatContent}>
            <Splitter className={styles.splitter}>
              <Splitter.Panel>
                <div className={styles.splitterPanel}>
                  {/* BubbleList 区域 */}
                  <div className={styles.messageListContainer}>
                    <ChatMessageList
                      messages={displayMessages}
                      isViewingHistory={!!selectedId} // 如果有选中的会话ID，说明在查看历史消息
                      onPreview={handlePreview}
                    />
                  </div>
                  {/* Sender 组件 - Flex布局在底部 */}
                  <div className={styles.bottomSenderWrapper}>
                    <div className={styles.bottomSenderContainer}>
                      <ChatMessageInput
                        value={inputValue}
                        onChange={setInputValue}
                        onSubmit={onSendMessage}
                        loading={sendingLoading}
                        onCancel={handleCancel}
                        searchMode={searchMode}
                        selectedKb={selectedKb}
                        onSearchModeChange={setSearchMode}
                        onKbSelectModalOpen={() => setKbSelectModalVisible(true)}
                        selectedModelAbilities={selectedModel?.abilities || defaultModel?.abilities}
                      />
                    </div>
                  </div>
                </div>
              </Splitter.Panel>
              {previewVisible && (
                <Splitter.Panel defaultSize="40%">
                  <PreviewPanel
                    content={previewContent}
                    onClose={() => setPreviewVisible(false)}
                  />
                </Splitter.Panel>
              )}
            </Splitter>
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
          setPreviewVisible(false); // 关闭预览面板
        }}
      />

      {/* 知识库选择模态框 */}
      <KnowledgeBaseSelectModal
        open={kbSelectModalVisible}
        onCancel={() => setKbSelectModalVisible(false)}
        onSelect={handleKbSelect}
      />
    </div>
  );
};

export default ChatPage;

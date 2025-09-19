import React from "react";
import {
  Button,
  Flex,
  Spin,
  theme,
} from "antd";
import {
  PlusOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  CommentOutlined,
} from "@ant-design/icons";
import { Conversations, ConversationsProps } from "@ant-design/x";

export interface ConversationItem {
  key: string;
  label: string;
  icon: string;
  group: string;
}

export interface ChatSidebarProps {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  conversations: ConversationItem[];
  selectedId: string;
  loading: boolean;
  onAddConversation: () => void;
  onSettingsClick: () => void;
  onConversationSelect: (key: string) => void;
  conversationMenu: ConversationsProps["menu"];
  groupable: ConversationsProps["groupable"];
}

const BOLD_BUTTON_STYLE = { fontWeight: "bold", fontSize: 18 };

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  collapsed,
  onCollapsedChange,
  conversations,
  selectedId,
  loading,
  onAddConversation,
  onSettingsClick,
  onConversationSelect,
  conversationMenu,
  groupable,
}) => {
  const { token } = theme.useToken();

  return (
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
            onClick={() => onCollapsedChange(false)}
            style={{
              fontSize: 18,
              color: token.colorText,
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
                onClick={onAddConversation}
              >
                新建对话
              </Button>
              <Button
                type="text"
                icon={<SettingOutlined />}
                style={BOLD_BUTTON_STYLE}
                onClick={onSettingsClick}
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
                  <div style={{ textAlign: "center", padding: "20px" }}>
                    <Spin size="small" />
                    <div style={{ marginTop: "8px", color: "#666" }}>
                      加载中...
                    </div>
                  </div>
                );
              }

              if (conversations.length === 0) {
                return (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "40px 20px",
                      color: "#999",
                    }}
                  >
                    <CommentOutlined
                      style={{
                        fontSize: "32px",
                        marginBottom: "12px",
                        display: "block",
                      }}
                    />
                    <div style={{ fontSize: "14px", marginBottom: "8px" }}>
                      暂无会话
                    </div>
                    <div style={{ fontSize: "12px" }}>
                      点击上方 + 按钮创建新会话
                    </div>
                  </div>
                );
              }

              return (
                <Conversations
                  style={{ width: "100%", color: "#222" }}
                  items={conversations}
                  activeKey={selectedId}
                  onActiveChange={onConversationSelect}
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
              onClick={() => onCollapsedChange(true)}
              style={{ width: "100%" }}
            >
              收起
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatSidebar;
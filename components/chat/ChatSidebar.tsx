import { Button, Spin, theme } from "antd";
import React from "react";

import {
  CommentOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PlusOutlined,
  SettingOutlined,
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
  creation?: ConversationsProps["creation"];
}

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
  creation,
}) => {
  const { token } = theme.useToken();

  const items = React.useMemo(() => {
    if (conversations.length === 0) return [];
    return conversations;
  }, [conversations]);

  return (
    <div
      style={{
        width: collapsed ? 64 : 280,
        transition: "width 0.2s ease-in-out",
        borderRight: `1px solid ${token.colorBorderSecondary}`,
        display: "flex",
        flexDirection: "column",
        background: token.colorBgContainer,
        height: "100%",
        color: token.colorText,
      }}
    >
      {/* 顶部操作区 (仅在折叠时显示新建按钮) */}
      {collapsed && (
        <div
          style={{
            padding: "16px 0 8px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Button
            type="text"
            icon={<PlusOutlined />}
            onClick={onAddConversation}
            style={{
              fontSize: 18,
              color: token.colorText,
              width: 40,
              height: 40,
            }}
          />
        </div>
      )}

      {/* 中间滚动区 */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          padding: collapsed ? 0 : 8,
          display: collapsed ? "none" : "block",
          boxSizing: "border-box",
        }}
      >
        {(() => {
          if (loading) {
            return (
              <div style={{ textAlign: "center", padding: "20px" }}>
                <Spin size="small" />
                <div
                  style={{
                    marginTop: "8px",
                    color: token.colorTextDescription,
                  }}
                >
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
                  color: token.colorTextDescription,
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
              </div>
            );
          }

          return (
            <Conversations
              style={{ width: "100%", color: token.colorText }}
              items={items}
              activeKey={selectedId}
              onActiveChange={onConversationSelect}
              menu={conversationMenu}
              groupable={groupable}
              creation={
                creation || {
                  label: (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <span>新建对话</span>
                      <span
                        style={{
                          fontSize: 12,
                          color: token.colorTextTertiary,
                          background: token.colorFillQuaternary,
                          padding: "0 4px",
                          borderRadius: 4,
                          fontFamily: "monospace",
                        }}
                      >
                        ⌘ O
                      </span>
                    </div>
                  ),
                  icon: <PlusOutlined />,
                  onClick: onAddConversation,
                }
              }
            />
          );
        })()}
      </div>

      {/* 底部工具栏 */}
      <div
        style={{
          padding: 12,
          borderTop: collapsed
            ? "none"
            : `1px solid ${token.colorBorderSecondary}`,
          display: "flex",
          flexDirection: collapsed ? "column" : "row",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          gap: 8,
        }}
      >
        <Button
          type="text"
          icon={<SettingOutlined />}
          onClick={onSettingsClick}
          style={{
            fontSize: 16,
            color: token.colorTextSecondary,
            width: collapsed ? 40 : undefined,
            height: collapsed ? 40 : undefined,
          }}
        />

        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => onCollapsedChange(!collapsed)}
          style={{
            fontSize: 16,
            color: token.colorTextSecondary,
            width: collapsed ? 40 : undefined,
            height: collapsed ? 40 : undefined,
          }}
        />
      </div>
    </div>
  );
};

export default ChatSidebar;

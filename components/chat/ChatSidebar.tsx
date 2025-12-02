import { Button, Spin, theme } from 'antd';
import KeyCode from 'rc-util/lib/KeyCode';
import React from 'react';

import {
    CommentOutlined, MenuFoldOutlined, MenuUnfoldOutlined, PlusOutlined, SettingOutlined
} from '@ant-design/icons';
import { Conversations, ConversationsProps } from '@ant-design/x';

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
        width: collapsed ? 48 : 280,
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
                  </div>
                );
              }

              return (
                <Conversations
                  style={{ width: "100%", color: "#222" }}
                  items={items}
                  activeKey={selectedId}
                  onActiveChange={onConversationSelect}
                  menu={conversationMenu}
                  groupable={groupable}
                  creation={creation || {
                    label: "新建对话",
                    icon: <PlusOutlined />,
                    onClick: onAddConversation,
                  }}
                  shortcutKeys={{
                    creation: ["Meta", KeyCode.O],
                    items: ["Alt", "number"],
                  }}
                />
              );
            })()}
          </div>
          <div
            style={{
              width: "100%",
              padding: 8,
              borderTop: "1px solid #f0f0f0",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Button
              type="text"
              icon={<MenuFoldOutlined />}
              onClick={() => onCollapsedChange(true)}
              style={{ flex: 1 }}
            >
              收起
            </Button>
            <Button
              type="text"
              icon={<SettingOutlined />}
              onClick={onSettingsClick}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ChatSidebar;

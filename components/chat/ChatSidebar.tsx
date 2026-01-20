import { Button, Spin, theme } from "antd";
import React from "react";
import classNames from "classnames";
import styles from "./ChatSidebar.module.css";

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

  const items = React.useMemo(() => {
    if (conversations.length === 0) return [];
    return conversations;
  }, [conversations]);

  return (
    <div
      className={classNames(styles.sidebar, {
        [styles.sidebarCollapsed]: collapsed,
      })}
    >
      {/* 顶部操作区 (仅在折叠时显示新建按钮) */}
      {collapsed && (
        <div className={styles.topActions}>
          <Button
            type="text"
            icon={<PlusOutlined />}
            onClick={onAddConversation}
            className={styles.addButton}
          />
        </div>
      )}

      {/* 中间滚动区 */}
      <div
        className={classNames(styles.scrollArea, {
          [styles.scrollAreaCollapsed]: collapsed,
        })}
      >
        {(() => {
          if (loading) {
            if (collapsed) {
              return null;
            }
            return (
              <div className={styles.loadingContainer}>
                <Spin size="small" />
                <div className={styles.loadingText}>
                  加载中...
                </div>
              </div>
            );
          }

          if (conversations.length === 0) {
            if (collapsed) {
              return null;
            }
            return (
              <div className={styles.emptyContainer}>
                <CommentOutlined className={styles.emptyIcon} />
                <div className={styles.emptyText}>
                  暂无会话
                </div>
              </div>
            );
          }

          if (collapsed) {
            return null;
          }

          return (
            <Conversations
              className={styles.conversations}
              items={items}
              activeKey={selectedId}
              onActiveChange={onConversationSelect}
              menu={conversationMenu}
              groupable={groupable}
              creation={
                creation || {
                  label: (
                    <div className={styles.newChatLabel}>
                      <span>新建对话</span>
                      <span className={styles.shortcutKey}>
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
        className={classNames(styles.bottomToolbar, {
          [styles.bottomToolbarCollapsed]: collapsed,
        })}
      >
        <Button
          type="text"
          icon={<SettingOutlined />}
          onClick={onSettingsClick}
          className={classNames(styles.toolbarButton, {
            [styles.toolbarButtonCollapsed]: collapsed,
          })}
        />

        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => onCollapsedChange(!collapsed)}
          className={classNames(styles.toolbarButton, {
            [styles.toolbarButtonCollapsed]: collapsed,
          })}
        />
      </div>
    </div>
  );
};

export default ChatSidebar;

import { Button, Divider, Flex, message as antdMessage, theme, Upload } from 'antd';
import React from 'react';

import { KnowledgeBase } from '@/lib/api/knowledgebase';
import { UploadOutlined } from '@ant-design/icons';
import { Sender } from '@ant-design/x';

// 样式常量
const ICON_SIZE = 15;
const BUTTON_SIZE = 18;

interface ChatMessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (message: string) => void;
  searchMode: "web" | "think" | "kb" | null;
  selectedKb: KnowledgeBase | null;
  onSearchModeChange: (mode: "web" | "think" | "kb" | null) => void;
  onKbSelectModalOpen: () => void;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  onCancel?: () => void;
  welcomeMessage?: string;
}

const ChatMessageInput: React.FC<ChatMessageInputProps> = ({
  value,
  onChange,
  onSubmit,
  searchMode,
  selectedKb,
  onSearchModeChange,
  onKbSelectModalOpen,
  placeholder = "请输入内容并回车...",
  disabled = false,
  loading = false,
  onCancel,
  welcomeMessage,
}) => {
  const { token } = theme.useToken();
  const [focused, setFocused] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      style={{
        boxShadow: focused
          ? `0 0 0 2px ${token.colorPrimaryBg}`
          : hovered
          ? "0 8px 24px rgba(0, 0, 0, 0.08)"
          : "0 2px 8px rgba(0, 0, 0, 0.04)",
        border: `1px solid ${
          focused
            ? token.colorPrimary
            : hovered
            ? token.colorPrimaryHover
            : token.colorBorder
        }`,
        borderRadius: 12,
        transition: "all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1)",
        background: token.colorBgContainer,
        width: '100%',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setFocused(false);
        }
      }}
    >
      <Sender
        style={{
          background: 'transparent',
          boxShadow: 'none',
          border: 'none',
        }}
        header={
        welcomeMessage ? (
          <div
            style={{
              padding: "12px 20px 0 20px",
              color: token.colorTextDescription,
              fontSize: 14,
            }}
          >
            {welcomeMessage}
          </div>
        ) : undefined
      }
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      allowSpeech={true}
      disabled={disabled}
      suffix={false}
      onSubmit={(val) => {
        if (loading) {
          return;
        }
        if (!val.trim()) {
          return;
        }
        onSubmit(val);
      }}
      onCancel={onCancel}
      footer={(_, { components }) => {
        const { SendButton, LoadingButton } = components;
        return (
          <Flex justify="space-between" align="center">
            {/* 左侧：Web搜索和知识库检索 */}
            <Flex gap="small" align="center">
              <Sender.Switch
                key="web"
                value={searchMode === "web"}
                onChange={() => {
                  if (searchMode === "web") {
                    onSearchModeChange(null);
                  } else {
                    onSearchModeChange("web");
                  }
                }}
              >
                搜索
              </Sender.Switch>
              <Sender.Switch
                key="think"
                value={searchMode === "think"}
                onChange={() => {
                  if (searchMode === "think") {
                    onSearchModeChange(null);
                  } else {
                    onSearchModeChange("think");
                  }
                }}
              >
                深度思考
              </Sender.Switch>
              <Sender.Switch
                key="kb"
                value={searchMode === "kb"}
                onChange={() => {
                  if (searchMode === "kb") {
                    onSearchModeChange(null);
                  } else {
                    onKbSelectModalOpen();
                  }
                }}
              >
                {searchMode === "kb" && selectedKb
                  ? "知识库：" + selectedKb.name
                  : "知识库"}
              </Sender.Switch>
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
                  icon={<UploadOutlined style={{ fontSize: ICON_SIZE }} />}
                  style={{
                    fontSize: BUTTON_SIZE,
                    color: token.colorText,
                  }}
                />
              </Upload>
              <Divider orientation="vertical" />
              {loading ? (
                <LoadingButton type="default" />
              ) : (
                <SendButton type="primary" disabled={disabled} />
              )}
            </Flex>
          </Flex>
        );
      }}
    />
    </div>
  );
};

export default ChatMessageInput;

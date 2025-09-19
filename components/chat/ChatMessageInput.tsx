import React from "react";
import { Sender } from "@ant-design/x";
import {
  SearchOutlined,
  UploadOutlined,
  GlobalOutlined,
  DatabaseOutlined,
} from "@ant-design/icons";
import {
  Button,
  Divider,
  Flex,
  theme,
  Dropdown,
  Upload,
  message as antdMessage,
} from "antd";
import { KnowledgeBase } from "@/lib/api/knowledgebase";

// 样式常量
const ICON_SIZE = 15;
const BUTTON_SIZE = 18;

interface ChatMessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (message: string) => void;
  searchMode: "web" | "kb" | null;
  selectedKb: KnowledgeBase | null;
  onSearchModeChange: (mode: "web" | "kb" | null) => void;
  onKbSelectModalOpen: () => void;
  placeholder?: string;
  disabled?: boolean;
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
}) => {
  const { token } = theme.useToken();

  // 获取模式标签
  const getModeLabel = () => {
    if (searchMode === "web") return "Web搜索";
    if (searchMode === "kb" && selectedKb) return selectedKb.name;
    if (searchMode === "kb") return "知识库检索";
    return "检索模式";
  };

  // 处理知识库选择
  const handleKbSelect = () => {
    if (searchMode === "kb") {
      // 如果当前已选择知识库检索，则取消
      onSearchModeChange(null);
    } else {
      // 否则弹出知识库选择模态框
      onKbSelectModalOpen();
    }
  };

  // 处理Web搜索选择
  const handleWebSelect = () => {
    if (searchMode === "web") {
      // 如果当前已选择Web搜索，则取消
      onSearchModeChange(null);
    } else {
      // 否则选择Web搜索
      onSearchModeChange("web");
    }
  };

  // 检索模式菜单
  const searchMenu = {
    items: [
      {
        key: "web",
        icon: <GlobalOutlined />,
        label: "Web搜索",
        onClick: handleWebSelect,
      },
      {
        key: "kb",
        icon: <DatabaseOutlined />,
        label: "知识库检索",
        onClick: handleKbSelect,
      },
    ],
  };

  // 处理检索模式按钮点击
  const handleSearchModeClick = () => {
    if (searchMode) {
      // 如果当前有选择的检索模式，则取消
      onSearchModeChange(null);
    }
    // 如果没有选择模式，Dropdown会自动显示菜单
  };

  const modeLabel = getModeLabel();

  return (
    <Sender
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      allowSpeech={false}
      actions={false}
      disabled={disabled}
      onSubmit={(val) => {
        onSubmit(val);
      }}
      footer={({ components }) => {
        const { SendButton, SpeechButton } = components;
        return (
          <Flex justify="space-between" align="center">
            {/* 左侧：检索模式 */}
            <Flex gap="small" align="center">
              <Dropdown
                menu={searchMenu}
                trigger={searchMode ? [] : ["click"]} // 已选择模式时不触发菜单
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
                  onClick={handleSearchModeClick}
                >
                  {modeLabel}
                </Button>
              </Dropdown>
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
                    <UploadOutlined style={{ fontSize: ICON_SIZE }} />
                  }
                  style={{
                    fontSize: BUTTON_SIZE,
                    color: token.colorText,
                  }}
                />
              </Upload>
              <Divider type="vertical" />
              <SpeechButton
                style={{
                  fontSize: ICON_SIZE,
                  color: token.colorText,
                }}
              />
              <Divider type="vertical" />
              <SendButton type="primary" disabled={disabled} />
            </Flex>
          </Flex>
        );
      }}
    />
  );
};

export default ChatMessageInput;
import { Button, Divider, Flex, Dropdown, MenuProps } from "antd";
import React, { useRef } from "react";

import { KnowledgeBase } from "@/lib/api/knowledgebase";
import {
  PlusOutlined,
  FileImageOutlined,
  FilePdfOutlined,
  VideoCameraOutlined,
  AudioOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Sender, Attachments, AttachmentsProps } from "@ant-design/x";
import { uploadFile } from "@/lib/api/upload";

interface ChatMessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (
    message: string,
    uploadId?: string,
    contentType?: string,
    fileUrl?: string
  ) => void;
  searchMode: "web" | "think" | "kb" | null;
  selectedKb: KnowledgeBase | null;
  onSearchModeChange: (mode: "web" | "think" | "kb" | null) => void;
  onKbSelectModalOpen: () => void;
  disabled?: boolean;
  loading?: boolean;
  onCancel?: () => void;
  selectedModelAbilities?: string;
}

const ChatMessageInput: React.FC<ChatMessageInputProps> = ({
  value,
  onChange,
  onSubmit,
  searchMode,
  selectedKb,
  onSearchModeChange,
  onKbSelectModalOpen,
  disabled = false,
  loading = false,
  onCancel,
  selectedModelAbilities,
}) => {
  // 上传相关状态
  const [uploadId, setUploadId] = React.useState<string | undefined>(undefined);
  const [contentType, setContentType] = React.useState<string | undefined>(
    undefined
  );
  const [fileName, setFileName] = React.useState<string | undefined>(undefined);
  const [uploading, setUploading] = React.useState(false);

  // Attachments items
  const [attachmentItems, setAttachmentItems] = React.useState<
    NonNullable<AttachmentsProps["items"]>
  >([]);
  const [open, setOpen] = React.useState(false);

  // Attachments ref
  const attachmentsRef = useRef<any>(null);

  // 检查是否支持深度思考
  const isThinkingSupported = React.useMemo(() => {
    if (!selectedModelAbilities) return false;
    return selectedModelAbilities.includes("THINKING");
  }, [selectedModelAbilities]);

  // 如果当前是深度思考模式但模型不支持，自动取消深度思考模式
  React.useEffect(() => {
    if (searchMode === "think" && !isThinkingSupported) {
      onSearchModeChange(null);
    }
  }, [isThinkingSupported, searchMode, onSearchModeChange]);

  // Handle file list change
  React.useEffect(() => {
    if (attachmentItems.length > 0) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [attachmentItems.length]);

  // 处理文件上传
  const handleFileUpload = async (file: File, type: string) => {
    if (uploading) return;

    // Create a temporary item for display
    const tempUid = Date.now().toString();
    const newItem: NonNullable<AttachmentsProps["items"]>[number] = {
      uid: tempUid,
      name: file.name,
      status: "uploading",
      url: URL.createObjectURL(file), // Create preview URL
      originFileObj: file as any,
      percent: 0,
    };

    // Replace existing items since we only support one file
    setAttachmentItems([newItem]);
    setUploading(true);

    // Simulate progress
    const timer = setInterval(() => {
      setAttachmentItems((prev) => {
        const item = prev.find((i) => i.uid === tempUid);
        if (!item || item.status !== "uploading") return prev;

        const nextPercent = (item.percent || 0) + 10;
        if (nextPercent >= 90) return prev;

        return prev.map((i) =>
          i.uid === tempUid ? { ...i, percent: nextPercent } : i
        );
      });
    }, 100);

    try {
      const uploadId = await uploadFile(file);

      clearInterval(timer);
      setUploadId(uploadId);
      setContentType(type);
      setFileName(file.name);

      // Update item status to done
      setAttachmentItems((prev) =>
        prev.map((item) =>
          item.uid === tempUid
            ? { ...item, status: "done", percent: 100 }
            : item
        )
      );
    } catch (error) {
      console.error(error);
      clearInterval(timer);

      // Update item status to error
      setAttachmentItems((prev) =>
        prev.map((item) =>
          item.uid === tempUid ? { ...item, status: "error" } : item
        )
      );
      // Clear upload state after a delay or immediately? Let's keep the error item visible
      setUploadId(undefined);
      setContentType(undefined);
      setFileName(undefined);
    } finally {
      setUploading(false);
    }
  };

  // 触发文件选择
  const triggerFileSelect = (accept: string, type: string) => {
    if (attachmentsRef.current) {
      attachmentsRef.current.select({ accept });
    } else {
      // Fallback if ref is not working as expected
      const input = document.createElement("input");
      input.type = "file";
      input.accept = accept;
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) handleFileUpload(file, type);
      };
      input.click();
    }
  };

  // 清除上传
  const clearUpload = () => {
    setUploadId(undefined);
    setContentType(undefined);
    setFileName(undefined);
    setAttachmentItems([]);
  };

  // 下拉菜单项
  const items: MenuProps["items"] = [
    {
      key: "image",
      label: "上传图片",
      icon: <FileImageOutlined />,
      onClick: () => {
        (window as any)._currentUploadType = "IMAGE";
        triggerFileSelect("image/*", "IMAGE");
      },
    },
    {
      key: "pdf",
      label: "上传文档",
      icon: <FilePdfOutlined />,
      onClick: () => {
        (window as any)._currentUploadType = "PDF";
        triggerFileSelect(".pdf", "PDF");
      },
    },
    {
      key: "video",
      label: "上传视频",
      icon: <VideoCameraOutlined />,
      onClick: () => {
        (window as any)._currentUploadType = "VIDEO";
        triggerFileSelect("video/*", "VIDEO");
      },
    },
    {
      key: "audio",
      label: "上传音频",
      icon: <AudioOutlined />,
      onClick: () => {
        (window as any)._currentUploadType = "AUDIO";
        triggerFileSelect("audio/*", "AUDIO");
      },
    },
  ];

  const attachmentsProps: AttachmentsProps = {
    beforeUpload(file) {
      const type = (window as any)._currentUploadType || "FILE";
      handleFileUpload(file, type);
      return false;
    },
    items: attachmentItems,
    onChange({ fileList }) {
      setAttachmentItems(fileList);
      if (fileList.length === 0) {
        clearUpload();
      }
    },
    getDropContainer: () => document.body,
    maxCount: 1,
  };

  const senderHeader = (
    <Sender.Header open={open} onOpenChange={setOpen}>
      <Attachments {...attachmentsProps} ref={attachmentsRef} />
    </Sender.Header>
  );

  return (
    <Sender
      header={fileName || uploading ? senderHeader : undefined}
      value={value}
      onChange={onChange}
      placeholder={"你好，可以问我任意问题～"}
      allowSpeech={true}
      disabled={disabled}
      autoSize={{ minRows: 2, maxRows: 8 }}
      styles={{
        root: {
          borderRadius: 30,
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1), 0 2px 2px rgba(0, 0, 0, 0.1)'
        },
        input: {
          fontSize: 15,
          padding: 10
        },
      }}
      suffix={false}
      onSubmit={(val) => {
        if (loading || uploading) {
          return;
        }
        if (!val.trim() && !uploadId) {
          return;
        }

        // Get file URL from attachment items if available
        const fileUrl =
          attachmentItems.length > 0 ? attachmentItems[0].url : undefined;

        onSubmit(val, uploadId, contentType, fileUrl);
        // 发送后清除上传状态
        clearUpload();
      }}
      onCancel={onCancel}
      footer={(_, { components }) => {
        const { SendButton, LoadingButton } = components;
        return (
          <Flex justify="space-between" align="center">
            {/* 左侧：上传 + Web搜索和知识库检索 */}
            <Flex gap="small" align="center">
              <Dropdown
                menu={{ items }}
                placement="topLeft"
                trigger={["click"]}
              >
                <Button type="text" icon={<PlusOutlined />} />
              </Dropdown>
              <Divider orientation="vertical" />
              <Sender.Switch
                key="web"
                styles={{
                  content: {
                    borderRadius: 16
                  }
                }}
                icon={<SearchOutlined />}
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
                styles={{
                  content: {
                    borderRadius: 16
                  }
                }}
                value={searchMode === "think"}
                disabled={!isThinkingSupported}
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
                styles={{
                  content: {
                    borderRadius: 16
                  }
                }} 
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
            {/* 右侧：发送按钮 */}
            <Flex align="center" gap={8}>
              {loading ? (
                <LoadingButton type="default" />
              ) : (
                <SendButton type="primary" disabled={disabled || uploading} />
              )}
            </Flex>
          </Flex>
        );
      }}
    />
  );
};

export default ChatMessageInput;

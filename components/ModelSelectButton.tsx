import React from 'react';
import { DownOutlined, PlusOutlined } from '@ant-design/icons';
import type { ModelListItem } from '@/lib/api/models';

interface ModelSelectButtonProps {
  selectedModel?: ModelListItem | null;
  defaultModel?: {
    modelName: string;
  } | null;
  onModelSelectClick: () => void;
  onSetDefaultClick: () => void;
  showSetDefault?: boolean; // 控制是否显示"设为默认"文本
}

const ModelSelectButton: React.FC<ModelSelectButtonProps> = ({
  selectedModel,
  defaultModel,
  onModelSelectClick,
  onSetDefaultClick,
  showSetDefault = true // 默认显示"设为默认"文本
}) => {
  const MODEL_SELECT_BUTTON_CONTAINER_STYLE = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "16px",
  };

  const MODEL_SELECT_BUTTON_STYLE = {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "flex-start",
    padding: "8px 12px",
    cursor: "pointer",
    minWidth: "200px",
  };

  return (
    <div style={MODEL_SELECT_BUTTON_CONTAINER_STYLE}>
      <div
        onClick={onModelSelectClick}
        style={MODEL_SELECT_BUTTON_STYLE}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ fontSize: "18px", fontWeight: "500" }}>
            {selectedModel 
              ? selectedModel.modelName 
              : defaultModel 
                ? defaultModel.modelName 
                : "未安装模型"
            }
          </div>
          <DownOutlined style={{ fontSize: "12px", color: "#666" }} />
          <PlusOutlined style={{ fontSize: "14px", color: "#666" }} />
        </div>
        {showSetDefault && (
          <div 
            style={{ 
              fontSize: "14px", 
              color: "#333", 
              marginTop: "2px",
              cursor: "pointer"
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSetDefaultClick();
            }}
          >
            设为默认
          </div>
        )}
      </div>
    </div>
  );
};

export default ModelSelectButton;
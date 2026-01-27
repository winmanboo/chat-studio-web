import {
  Button,
  Dropdown,
  Input,
  MenuProps,
  message,
  Spin,
  Tooltip,
  theme
} from "antd";
import React from "react";

import {
  BulbOutlined,
  CheckCircleOutlined,
  DownOutlined,
  EyeOutlined,
  GlobalOutlined,
  PictureOutlined,
  RobotOutlined,
  SettingOutlined,
  ToolOutlined,
} from "@ant-design/icons";

import styles from "./ModelSelectButton.module.css";

import type {
  ModelListItem,
  ModelProviderWithModels,
  DefaultModel,
} from "@/lib/api/models";
interface ModelSelectButtonProps {
  selectedModel?: ModelListItem | null;
  defaultModel?: DefaultModel | null;
  onSetDefaultClick: () => void;
  showSetDefault?: boolean; // 控制是否显示"设为默认"文本
  modelList?: ModelProviderWithModels[];
  onModelSelect?: (model: ModelListItem) => void;
  onDropdownOpen?: () => void;
}

const ModelSelectButton: React.FC<ModelSelectButtonProps> = ({
  selectedModel,
  defaultModel,
  onSetDefaultClick,
  showSetDefault = true, // 默认显示"设为默认"文本
  modelList,
  onModelSelect,
  onDropdownOpen,
}) => {
  const { token } = theme.useToken();
  const [searchValue, setSearchValue] = React.useState("");

  // 渲染能力图标组件
  const renderAbilityIcons = (abilities?: string) => {
    if (!abilities) return null;

    const abilityList = abilities.split(",").map((a) => a.trim());
    const icons: React.ReactNode[] = [];

    if (abilityList.includes("THINKING")) {
      icons.push(
        <Tooltip key="thinking" title="深度思考">
          <BulbOutlined style={{ color: token.colorWarning }} />
        </Tooltip>
      );
    }

    if (abilityList.includes("VISUAL_UNDERSTANDING")) {
      icons.push(
        <Tooltip key="visual" title="视觉理解">
          <EyeOutlined style={{ color: token.colorSuccess }} />
        </Tooltip>
      );
    }

    if (abilityList.includes("IMAGE_GENERATION")) {
      icons.push(
        <Tooltip key="image" title="图片生成">
          <PictureOutlined style={{ color: token.purple6 }} />
        </Tooltip>
      );
    }

    if (abilityList.includes("TOOL")) {
      icons.push(
        <Tooltip key="tool" title="工具调用">
          <ToolOutlined style={{ color: token.colorInfo }} />
        </Tooltip>
      );
    }

    if (abilityList.includes("NETWORK")) {
      icons.push(
        <Tooltip key="network" title="联网搜索">
          <GlobalOutlined style={{ color: token.colorLink }} />
        </Tooltip>
      );
    }

    if (icons.length === 0) return null;

    return (
      <div
        style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: 8 }}
        onClick={(e) => e.stopPropagation()}
      >
        {icons}
      </div>
    );
  };

  const displayModelName = selectedModel
    ? selectedModel.modelName
    : defaultModel
    ? defaultModel.modelName
    : "未安装模型";

  const displayIcon = selectedModel?.icon || defaultModel?.icon;

  // 过滤模型列表
  const filteredModelList = React.useMemo(() => {
    if (!modelList) return [];
    if (!searchValue) return modelList;

    const lowerSearch = searchValue.toLowerCase();

    return modelList
      .map((provider) => {
        // 1. 检查提供商名称是否匹配
        const providerMatches = provider.providerName
          .toLowerCase()
          .includes(lowerSearch);

        // 2. 检查模型名称是否匹配
        const filteredModels = provider.models.filter((model) =>
          model.modelName.toLowerCase().includes(lowerSearch)
        );

        // 如果提供商名称匹配，显示该提供商下的所有模型
        if (providerMatches) {
          return provider;
        }

        // 如果只有模型名称匹配，只显示匹配的模型
        if (filteredModels.length > 0) {
          return {
            ...provider,
            models: filteredModels,
          };
        }

        return null;
      })
      .filter(Boolean) as ModelProviderWithModels[];
  }, [modelList, searchValue]);

  // 构建下拉菜单项
  const menuItems: MenuProps["items"] = React.useMemo(() => {
    if (!filteredModelList || filteredModelList.length === 0) {
      return [
        {
          key: "empty",
          label: <span>{searchValue ? "未找到相关模型" : "暂无可用模型"}</span>,
          disabled: true,
        },
      ];
    }

    return filteredModelList.map((provider) => ({
      key: provider.providerId,
      type: "group",
      label: provider.providerName,
      children: provider.models.map((model) => {
        const iconUrl = model.icon || provider.icon;
        return {
          key: String(model.id),
          label: (
            <div className={styles.menuItemLabel}>
              <span>{model.modelName}</span>
              {renderAbilityIcons(model.abilities)}
            </div>
          ),
          icon: iconUrl ? (
            <img
              src={iconUrl}
              alt={model.modelName}
              className={styles.menuItemIcon}
            />
          ) : (
            <RobotOutlined />
          ),
          onClick: () =>
            onModelSelect &&
            onModelSelect({
              ...model,
              icon: iconUrl,
              providerId: provider.providerId,
            }),
        };
      }),
    }));
  }, [filteredModelList, onModelSelect, searchValue]);

  const CardContent = (
    <div className={styles.cardContent}>
      <div className={styles.modelInfo}>
        {displayIcon ? (
          <img src={displayIcon} alt="icon" className={styles.modelIcon} />
        ) : (
          <div className={styles.fallbackIcon}>
            <RobotOutlined />
          </div>
        )}
        <span className={styles.modelName}>{displayModelName}</span>
      </div>
      <div className={styles.cardActions}>
        <Tooltip title="模型设置">
          <Button
            type="text"
            size="small"
            icon={<SettingOutlined style={{ fontSize: 12 }} />}
            onClick={(e) => {
              e.stopPropagation();
              message.info("功能正在开发中");
            }}
            className={styles.settingsButton}
          />
        </Tooltip>
        <DownOutlined className={styles.downIcon} />
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      {/* 模型卡片 - 始终使用 Dropdown */}
      <Dropdown
        menu={{
          items: menuItems,
        }}
        trigger={["click"]}
        placement="bottomLeft"
        onOpenChange={(open) => {
          if (open) {
            setSearchValue(""); // 打开时重置搜索
            if (onDropdownOpen) {
              onDropdownOpen();
            }
          }
        }}
        popupRender={(menu) => (
          <div style={{backgroundColor: '#fff'}}>
            <div style={{ padding: "8px" }}>
              <Input
                placeholder="搜索模型..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                allowClear
                variant="borderless"
                className={styles.searchInput}
                onClick={(e) => e.stopPropagation()} // 防止点击输入框关闭下拉
                onKeyDown={(e) => e.stopPropagation()} // 防止按键事件冒泡
              />
            </div>
            {React.isValidElement(menu)
              ? React.cloneElement(menu as React.ReactElement<any>,)
              : menu}
          </div>
        )}
      >
        {CardContent}
      </Dropdown>

      {/* 附属操作区 */}
      {showSetDefault && (
        <Tooltip title="设为默认模型">
          <Button
            type="text"
            icon={<CheckCircleOutlined />}
            onClick={onSetDefaultClick}
            className={styles.setDefaultButton}
          />
        </Tooltip>
      )}
    </div>
  );
};

export default ModelSelectButton;

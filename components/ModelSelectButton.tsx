import React from 'react';
import { DownOutlined, SettingOutlined, RobotOutlined, CheckCircleOutlined } from '@ant-design/icons';
import type { ModelListItem, ModelProviderWithModels, DefaultModel } from '@/lib/api/models';
import { theme, Tooltip, Button, Dropdown, type MenuProps, Spin, message } from 'antd';

interface ModelSelectButtonProps {
  selectedModel?: ModelListItem | null;
  defaultModel?: DefaultModel | null;
  onSetDefaultClick: () => void;
  showSetDefault?: boolean; // 控制是否显示"设为默认"文本
  modelList?: ModelProviderWithModels[];
  onModelSelect?: (model: ModelListItem) => void;
  loading?: boolean;
  onDropdownOpen?: () => void;
}

const ModelSelectButton: React.FC<ModelSelectButtonProps> = ({
  selectedModel,
  defaultModel,
  onSetDefaultClick,
  showSetDefault = true, // 默认显示"设为默认"文本
  modelList,
  onModelSelect,
  loading = false,
  onDropdownOpen,
}) => {
  const { token } = theme.useToken();
  const [hovered, setHovered] = React.useState(false);

  const displayModelName = selectedModel 
    ? selectedModel.modelName 
    : defaultModel 
      ? defaultModel.modelName 
      : "未安装模型";

  const displayIcon = selectedModel?.icon || defaultModel?.icon;

  // 构建下拉菜单项
  const menuItems: MenuProps['items'] = React.useMemo(() => {
    if (loading) {
      return [
        {
          key: 'loading',
          label: (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
              <Spin size="small" />
            </div>
          ),
          disabled: true,
        }
      ];
    }

    if (!modelList || modelList.length === 0) {
      return [
        {
          key: 'empty',
          label: <span style={{ color: token.colorTextDescription }}>暂无可用模型</span>,
          disabled: true,
        }
      ];
    }
    
    return modelList.map(provider => ({
      key: provider.providerId,
      type: 'group',
      label: provider.providerName,
      children: provider.models.map(model => {
        const iconUrl = model.icon || provider.icon;
        return {
          key: String(model.id),
          label: model.modelName,
          icon: iconUrl ? (
            <img 
              src={iconUrl} 
              alt={model.modelName} 
              style={{ 
                width: 16, 
                height: 16, 
                borderRadius: 2,
                objectFit: 'contain' 
              }} 
            />
          ) : <RobotOutlined />,
          onClick: () => onModelSelect && onModelSelect({ ...model, icon: iconUrl, providerId: provider.providerId }),
        };
      })
    }));
  }, [modelList, onModelSelect, loading, token]);

  const CardContent = (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 12px',
        borderRadius: 12,
        background: hovered ? token.colorFillSecondary : token.colorFillQuaternary,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        border: `1px solid ${hovered ? token.colorBorder : 'transparent'}`,
        minWidth: 180,
        boxShadow: hovered ? token.boxShadowTertiary : 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {displayIcon ? (
          <img 
            src={displayIcon} 
            alt="icon" 
            style={{ 
              width: 24, 
              height: 24, 
              borderRadius: 6,
              objectFit: 'cover'
            }} 
          />
        ) : (
          <div style={{
            width: 24,
            height: 24,
            borderRadius: 6,
            background: token.colorPrimaryBg,
            color: token.colorPrimary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14,
          }}>
            <RobotOutlined />
          </div>
        )}
        <span style={{ 
          fontWeight: 500, 
          color: token.colorText,
          fontSize: 14 
        }}>
          {displayModelName}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <Tooltip title="模型设置">
          <Button
            type="text"
            size="small"
            icon={<SettingOutlined style={{ fontSize: 12 }} />}
            onClick={(e) => {
              e.stopPropagation();
              message.info("功能正在开发中");
            }}
            style={{
              color: token.colorTextSecondary,
              width: 24,
              height: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          />
        </Tooltip>
        <DownOutlined style={{ fontSize: 10, color: token.colorTextTertiary, marginLeft: 4 }} />
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {/* 模型卡片 - 始终使用 Dropdown */}
      <Dropdown 
        menu={{ 
          items: menuItems,
          style: { maxHeight: 400, overflowY: 'auto', minWidth: 200 }
        }} 
        trigger={['click']}
        placement="bottomLeft"
        onOpenChange={(open) => {
          if (open && onDropdownOpen) {
            onDropdownOpen();
          }
        }}
      >
        {CardContent}
      </Dropdown>

      {/* 附属操作区 */}


      {/* 附属操作区 */}
      {showSetDefault && (
        <Tooltip title="设为默认模型">
          <Button
            type="text"
            icon={<CheckCircleOutlined />}
            onClick={onSetDefaultClick}
            style={{
              color: token.colorTextSecondary,
              fontSize: 16,
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          />
        </Tooltip>
      )}
    </div>
  );
};

export default ModelSelectButton;
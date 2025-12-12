import React from 'react';
import { DownOutlined, SettingOutlined, RobotOutlined, CheckCircleOutlined } from '@ant-design/icons';
import type { ModelListItem, ModelProviderWithModels, DefaultModel } from '@/lib/api/models';
import { theme, Tooltip, Button, Dropdown, type MenuProps, Spin, message, Input, Divider } from 'antd';

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
  const [searchValue, setSearchValue] = React.useState('');

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

    return modelList.map(provider => {
      // 1. 检查提供商名称是否匹配
      const providerMatches = provider.providerName.toLowerCase().includes(lowerSearch);
      
      // 2. 检查模型名称是否匹配
      const filteredModels = provider.models.filter(model => 
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
          models: filteredModels
        };
      }

      return null;
    }).filter(Boolean) as ModelProviderWithModels[];
  }, [modelList, searchValue]);

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

    if (!filteredModelList || filteredModelList.length === 0) {
      return [
        {
          key: 'empty',
          label: <span style={{ color: token.colorTextDescription }}>
            {searchValue ? '未找到相关模型' : '暂无可用模型'}
          </span>,
          disabled: true,
        }
      ];
    }
    
    return filteredModelList.map(provider => ({
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
  }, [filteredModelList, onModelSelect, loading, token, searchValue]);

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
          if (open) {
            setSearchValue(''); // 打开时重置搜索
            if (onDropdownOpen) {
              onDropdownOpen();
            }
          }
        }}
        popupRender={(menu) => (
          <div style={{ 
            backgroundColor: token.colorBgElevated,
            borderRadius: token.borderRadiusLG,
            boxShadow: token.boxShadowSecondary,
            padding: 4,
          }}>
            <div style={{ padding: '8px 8px 4px 8px' }}>
              <Input
                placeholder="搜索模型..."
                value={searchValue}
                onChange={e => setSearchValue(e.target.value)}
                allowClear
                variant='borderless'
                style={{
                  background: token.colorFillAlter,
                  borderRadius: token.borderRadius,
                  padding: '4px 8px'
                }}
                onClick={(e) => e.stopPropagation()} // 防止点击输入框关闭下拉
                onKeyDown={(e) => e.stopPropagation()} // 防止按键事件冒泡
              />
            </div>
            {React.isValidElement(menu) ? React.cloneElement(menu as React.ReactElement<any>, { style: { ...(menu.props as any)?.style, boxShadow: 'none' } }) : menu}
          </div>
        )}
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
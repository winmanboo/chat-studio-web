import React, { useState, useEffect } from 'react';
import { Typography, Card, Button, Row, Col, Tag, Divider, Spin, message } from 'antd';
import { DownloadOutlined, SettingOutlined, CloudOutlined, DesktopOutlined } from '@ant-design/icons';
import { getModelProviders, ModelProvider, getInstalledModels, InstalledModel } from '../../lib/api';
import ModelSettingsModal from './ModelSettingsModal';
import InstallModelModal from './InstallModelModal';

const { Title, Text } = Typography;



const ModelPanel: React.FC = () => {
  const [modelProviders, setModelProviders] = useState<ModelProvider[]>([]);
  const [installedModels, setInstalledModels] = useState<InstalledModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<InstalledModel | null>(null);
  const [installModalOpen, setInstallModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ModelProvider | null>(null);

  // 获取数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [providers, installed] = await Promise.all([
          getModelProviders(),
          getInstalledModels()
        ]);
        setModelProviders(providers);
        setInstalledModels(installed);
      } catch (error) {
        console.error('获取数据失败:', error);
        message.error('获取模型数据失败');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 渲染模型类型图标
  const renderModelTypeIcon = (sourceType: 'service' | 'local') => {
    return sourceType === 'service' ? (
      <CloudOutlined style={{ color: '#1890ff' }} />
    ) : (
      <DesktopOutlined style={{ color: '#52c41a' }} />
    );
  };

  // 渲染模型类型标签
  const renderModelTypeTag = (sourceType: 'service' | 'local') => {
    return sourceType === 'service' ? (
      <Tag color="blue" icon={<CloudOutlined />}>云端模型</Tag>
    ) : (
      <Tag color="green" icon={<DesktopOutlined />}>本地模型</Tag>
    );
  };

  // 打开设置弹窗
  const handleOpenSettings = (model: InstalledModel) => {
    setSelectedModel(model);
    setSettingsModalOpen(true);
  };

  // 关闭设置弹窗
  const handleCloseSettings = () => {
    setSettingsModalOpen(false);
    setSelectedModel(null);
  };

  // 打开安装弹窗
  const handleOpenInstall = (provider: ModelProvider) => {
    setSelectedProvider(provider);
    setInstallModalOpen(true);
  };

  // 关闭安装弹窗
  const handleCloseInstall = () => {
    setInstallModalOpen(false);
    setSelectedProvider(null);
  };

  // 安装成功后刷新已安装模型列表
  const handleInstallSuccess = async () => {
    try {
      const installed = await getInstalledModels();
      setInstalledModels(installed);
    } catch (error) {
      console.error('刷新模型列表失败:', error);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>加载模型数据...</div>
      </div>
    );
  }
  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>模型管理</Title>
      
      {/* 已安装模型列表 */}
      <div style={{ marginBottom: 32 }}>
        <Title level={5} style={{ marginBottom: 16 }}>已安装模型</Title>
        <Row gutter={[16, 16]}>
          {installedModels.map((model) => (
            <Col xs={24} sm={12} lg={8} key={model.id}>
              <Card
                size="small"
                title={
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {renderModelTypeIcon(model.sourceType)}
                      <span>{model.modelInstalledName}</span>
                    </div>
                    <Tag color={model.enabled ? 'green' : 'default'}>
                      {model.enabled ? '启用' : '禁用'}
                    </Tag>
                  </div>
                }
                extra={
                  <Button 
                    type="text" 
                    icon={<SettingOutlined />} 
                    size="small"
                    title="模型设置"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenSettings(model);
                    }}
                  />
                }
                style={{ height: '100%' }}
              >
                <div style={{ marginBottom: 8 }}>
                  {renderModelTypeTag(model.sourceType)}
                </div>
                <Text style={{ fontSize: 12, color: '#666' }}>
                  {model.sourceType === 'service' ? '云端托管的AI模型服务' : '本地部署的AI模型'}
                </Text>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      <Divider />

      {/* 模型提供商列表 */}
       <div>
         <Title level={5} style={{ marginBottom: 16 }}>模型提供商</Title>
         <Row gutter={[16, 16]}>
           {modelProviders.map((provider) => (
             <Col xs={24} sm={12} lg={8} key={provider.id}>
               <Card
                  size="small"
                  title={
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <img src={provider.icon} alt={provider.providerName} style={{ width: 20, height: 20, marginRight: 8 }} />
                      <span>{provider.providerName}</span>
                    </div>
                  }
                  style={{ height: 200, borderRadius: 12, position: 'relative' }}
                  bodyStyle={{ padding: '16px 16px 56px 16px', height: 'calc(100% - 57px)' }}
                >
                  <div style={{ height: '100%', overflow: 'hidden' }}>
                    <div style={{ marginBottom: 12 }}>
                      <Text style={{ fontSize: 12, color: '#666' }}>
                        {provider.desc}
                      </Text>
                    </div>
                  </div>
                  <Button 
                    type="primary"
                    icon={<DownloadOutlined />}
                    style={{ 
                      position: 'absolute',
                      bottom: 16,
                      left: 16,
                      right: 16,
                      width: 'calc(100% - 32px)',
                      borderRadius: 8
                    }}
                    size="small"
                    onClick={() => handleOpenInstall(provider)}
                  >
                    安装
                  </Button>
                </Card>
             </Col>
           ))}
         </Row>
       </div>

      {/* 模型设置弹窗 */}
      <ModelSettingsModal
        open={settingsModalOpen}
        onClose={handleCloseSettings}
        model={selectedModel}
      />
      
      {/* 模型安装弹窗 */}
      <InstallModelModal
        open={installModalOpen}
        onClose={handleCloseInstall}
        provider={selectedProvider}
        onInstallSuccess={handleInstallSuccess}
      />
    </div>
  );
};

export default ModelPanel;
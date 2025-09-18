import React, { useState, useEffect } from 'react';
import { Modal, Row, Col, Card, Typography, Spin, message } from 'antd';
import { StarFilled, CheckOutlined } from '@ant-design/icons';
import { getModelList } from '@/lib/api/models';
import type { ModelProviderWithModels, ModelListItem } from '@/lib/api/models';

const { Title, Text } = Typography;

interface ModelSelectModalProps {
  open: boolean;
  onCancel: () => void;
  onSelect: (model: ModelListItem & { providerId: string }) => void;
  selectedModel?: ModelListItem | null;
}

const ModelSelectModal: React.FC<ModelSelectModalProps> = ({
  open,
  onCancel,
  onSelect,
  selectedModel
}) => {
  const [modelProviders, setModelProviders] = useState<ModelProviderWithModels[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [filteredModels, setFilteredModels] = useState<(ModelListItem & { providerId: string })[]>([]);

  // 获取数据
  const fetchData = async () => {
    try {
      setLoading(true);
      const providers = await getModelList();
      setModelProviders(providers);
      
      // 默认显示所有模型，并为每个模型添加providerId
      const allModels = providers.flatMap(provider => 
        provider.models.map(model => ({ ...model, providerId: provider.providerId }))
      );
      setFilteredModels(allModels);
    } catch (error) {
      console.error('获取模型数据失败:', error);
      message.error('获取模型数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 当模态框打开时获取数据
  useEffect(() => {
    if (open) {
      // 清空之前的数据状态
      setModelProviders([]);
      setFilteredModels([]);
      setSelectedProvider(null);
      fetchData();
    }
  }, [open]);

  // 根据选中的提供商过滤模型
  useEffect(() => {
    if (selectedProvider) {
      const provider = modelProviders.find(p => p.providerId === selectedProvider);
      setFilteredModels(provider ? provider.models.map(model => ({ ...model, providerId: provider.providerId })) : []);
    } else {
      // 显示所有模型，并为每个模型添加providerId
      const allModels = modelProviders.flatMap(provider => 
        provider.models.map(model => ({ ...model, providerId: provider.providerId }))
      );
      setFilteredModels(allModels);
    }
  }, [selectedProvider, modelProviders]);

  // 处理模型选择
  const handleModelSelect = (model: ModelListItem & { providerId: string }) => {
    onSelect(model);
    onCancel();
  };

  // 处理提供商选择
  const handleProviderSelect = (providerId: string) => {
    setSelectedProvider(selectedProvider === providerId ? null : providerId);
  };

  return (
    <Modal
      title="选择模型"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={800}
      height={600}
      centered
      destroyOnClose
      styles={{
        body: { padding: 0, height: 500, overflow: 'hidden' }
      }}
    >
      <div style={{ height: '100%', padding: 24 }}>
        <Row style={{ height: '100%' }}>
          {/* 左侧提供商列表 */}
          <Col span={8} style={{ borderRight: '1px solid #f0f0f0', paddingRight: 16, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Title level={5} style={{ marginBottom: 16, flexShrink: 0 }}>模型提供商</Title>
            <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '50px 0' }}>
                  <Spin />
                </div>
              ) : (
                <div>
                  {modelProviders.map((provider: ModelProviderWithModels) => (
                    <div
                      key={provider.providerId}
                      style={{
                        cursor: 'pointer',
                        padding: '12px 8px',
                        borderRadius: 8,
                        marginBottom: 4,
                        backgroundColor: selectedProvider === provider.providerId ? '#f6ffed' : 'transparent',
                        border: selectedProvider === provider.providerId ? '1px solid #b7eb8f' : '1px solid transparent',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      onClick={() => handleProviderSelect(provider.providerId)}
                    >
                      <div style={{ marginRight: 12 }}>
                        <img 
                          src={provider.icon} 
                          alt={provider.providerName} 
                          style={{ width: 32, height: 32, borderRadius: '50%' }} 
                        />
                      </div>
                      <div>
                        <div>
                          <Text strong style={{ fontSize: 14 }}>
                            {provider.providerName}
                          </Text>
                        </div>
                        <div>
                          <Text style={{ fontSize: 12, color: '#666' }}>
                            {`${provider.models.length} 个模型`}
                          </Text>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Col>

          {/* 右侧模型列表 */}
          <Col span={16} style={{ paddingLeft: 16, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Title level={5} style={{ marginBottom: 16, flexShrink: 0 }}>可用模型</Title>
            <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '50px 0' }}>
                  <Spin />
                </div>
              ) : filteredModels.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px 0', color: '#999' }}>
                  <Text>暂无可用模型</Text>
                </div>
              ) : (
                <div 
                  style={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '12px',
                    padding: '4px'
                  }}
                >
                  {filteredModels.map((model, index) => (
                    <Card
                      key={`${model.id}-${model.modelName}-${index}`}
                      size="small"
                      style={{ 
                        cursor: 'pointer',
                        border: '1px solid #d9d9d9',
                        backgroundColor: 'white',
                        borderRadius: 8,
                        minHeight: '80px'
                      }}
                      bodyStyle={{ padding: 12 }}
                      onClick={() => handleModelSelect(model)}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
                          <Text 
                            strong 
                            style={{ 
                              fontSize: 14,
                              lineHeight: '20px',
                              wordBreak: 'break-word',
                              flex: 1
                            }}
                          >
                            {model.modelName}
                          </Text>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 4 }}>
                            {model.def && (
                              <StarFilled style={{ color: '#faad14', fontSize: 14 }} />
                            )}
                          </div>
                        </div>
                        
                        {/* 发布时间 */}
                        {model.created && (
                          <div style={{ marginBottom: 8 }}>
                            <Text style={{ fontSize: 12, color: '#999' }}>
                              发布时间: {new Date(model.created * 1000).toLocaleDateString('zh-CN')}
                            </Text>
                          </div>
                        )}
                        
                        {model.def && (
                          <div style={{ marginTop: 'auto' }}>
                            <span style={{ 
                              fontSize: 11, 
                              color: '#faad14', 
                              backgroundColor: '#fff7e6', 
                              padding: '2px 6px', 
                              borderRadius: 4,
                              border: '1px solid #ffd591',
                              whiteSpace: 'nowrap'
                            }}>
                              默认模型
                            </span>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </Col>
        </Row>
      </div>
    </Modal>
  );
};

export default ModelSelectModal;
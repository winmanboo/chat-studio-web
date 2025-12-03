import React, { useState, useEffect } from 'react';
import { Modal, List, Input, Spin, message, Tag, Empty, Pagination, theme, Typography, Flex, Avatar, Space } from 'antd';
import { SearchOutlined, DatabaseOutlined, CalendarOutlined, FileTextOutlined } from '@ant-design/icons';
import { getKnowledgeBasePage, KnowledgeBase, PageParams } from '@/lib/api/knowledgebase';

const { Search } = Input;
const { Text, Title } = Typography;

interface KnowledgeBaseSelectModalProps {
  open: boolean;
  onCancel: () => void;
  onSelect: (kb: KnowledgeBase) => void;
}

const KnowledgeBaseSelectModal: React.FC<KnowledgeBaseSelectModalProps> = ({
  open,
  onCancel,
  onSelect
}) => {
  const { token } = theme.useToken();
  const [loading, setLoading] = useState(false);
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  // 加载知识库列表
  const loadKnowledgeBases = async (page: number = 1, keyword?: string) => {
    try {
      setLoading(true);
      const params: PageParams = {
        pageNum: page,
        pageSize,
        ...(keyword && { keyword })
      };
      const response = await getKnowledgeBasePage(params);
      setKnowledgeBases(response?.records || []);
      setTotal(response?.total || 0);
      setCurrentPage(page);
    } catch (error) {
      console.error('加载知识库列表失败:', error);
      message.error('加载知识库列表失败');
      setKnowledgeBases([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // 搜索处理
  const handleSearch = (value: string) => {
    setSearchValue(value);
    setCurrentPage(1);
    loadKnowledgeBases(1, value);
  };

  // 分页处理
  const handlePageChange = (page: number) => {
    loadKnowledgeBases(page, searchValue);
  };

  // 选择知识库
  const handleSelectKb = (kb: KnowledgeBase) => {
    onSelect(kb);
    onCancel();
  };

  // 模态框打开时加载数据
  useEffect(() => {
    if (open) {
      loadKnowledgeBases();
    }
  }, [open]);

  // 模态框关闭时重置状态
  const handleCancelModal = () => {
    setSearchValue('');
    setCurrentPage(1);
    setKnowledgeBases([]);
    setTotal(0);
    onCancel();
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <DatabaseOutlined style={{ color: token.colorPrimary }} />
          <span>选择知识库</span>
        </div>
      }
      open={open}
      onCancel={handleCancelModal}
      footer={null}
      width={640}
      destroyOnClose
      centered
      styles={{
        body: { padding: '24px' }
      }}
    >
      <div style={{ marginBottom: 24 }}>
        <Search
          placeholder="搜索知识库名称或描述..."
          allowClear
          enterButton={<SearchOutlined />}
          onSearch={handleSearch}
          size="large"
          style={{ width: '100%' }}
        />
      </div>
      
      <Spin spinning={loading}>
        {knowledgeBases.length === 0 && !loading ? (
          <Empty 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="暂无可选知识库" 
            style={{ margin: '48px 0' }}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ maxHeight: '480px', overflowY: 'auto', paddingRight: 4 }}>
              <List
                dataSource={knowledgeBases}
                split={false}
                renderItem={(item) => (
                  <List.Item
                    key={item.id}
                    onClick={() => handleSelectKb(item)}
                    style={{
                      cursor: 'pointer',
                      padding: '16px',
                      borderRadius: token.borderRadiusLG,
                      border: `1px solid ${token.colorBorderSecondary}`,
                      marginBottom: 12,
                      backgroundColor: token.colorBgContainer,
                      transition: 'all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1)',
                    }}
                    className="kb-item"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = token.colorPrimary;
                      e.currentTarget.style.boxShadow = token.boxShadow;
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = token.colorBorderSecondary;
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.transform = 'none';
                    }}
                  >
                    <Flex gap={16} style={{ width: '100%' }} align="start">
                      {/* 图标区域 */}
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 12,
                          backgroundColor: token.colorPrimaryBg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <DatabaseOutlined style={{ fontSize: 24, color: token.colorPrimary }} />
                      </div>

                      {/* 内容区域 */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Flex justify="space-between" align="center" style={{ marginBottom: 4 }}>
                          <Text strong style={{ fontSize: 16, color: token.colorText }}>
                            {item.name}
                          </Text>
                          <Tag 
                            color="blue" 
                            icon={<FileTextOutlined />} 
                            style={{ margin: 0, borderRadius: 12, padding: '0 10px' }}
                          >
                            {item.docCount} 文档
                          </Tag>
                        </Flex>

                        <Text 
                          type="secondary" 
                          style={{ 
                            display: 'block', 
                            marginBottom: 12, 
                            fontSize: 14,
                            lineHeight: 1.5,
                            ...(!item.description ? { fontStyle: 'italic', opacity: 0.6 } : {})
                          }}
                          ellipsis={{ tooltip: true }}
                        >
                          {item.description || '暂无描述信息'}
                        </Text>

                        <Flex justify="space-between" align="center">
                          <Space size={[0, 8]} wrap style={{ flex: 1 }}>
                            {item.tags && item.tags.length > 0 ? (
                              item.tags.slice(0, 3).map(tag => (
                                <Tag 
                                  key={tag.id} 
                                  bordered={false}
                                  style={{ 
                                    background: token.colorFillQuaternary,
                                    color: token.colorTextSecondary,
                                    marginRight: 4
                                  }}
                                >
                                  {tag.name}
                                </Tag>
                              ))
                            ) : (
                              <span />
                            )}
                            {item.tags && item.tags.length > 3 && (
                              <Text type="secondary" style={{ fontSize: 12 }}>+{item.tags.length - 3}</Text>
                            )}
                          </Space>

                          <Text type="secondary" style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <CalendarOutlined />
                            {new Date(item.createdTime).toLocaleDateString()}
                          </Text>
                        </Flex>
                      </div>
                    </Flex>
                  </List.Item>
                )}
              />
            </div>
            
            {total > pageSize && (
              <div style={{ textAlign: 'center', paddingTop: 16, borderTop: `1px solid ${token.colorBorderSecondary}` }}>
                <Pagination
                  current={currentPage}
                  total={total}
                  pageSize={pageSize}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                  showQuickJumper
                  size="small"
                  showTotal={(total) => `共 ${total} 个知识库`}
                />
              </div>
            )}
          </div>
        )}
      </Spin>
    </Modal>
  );
};

export default KnowledgeBaseSelectModal;
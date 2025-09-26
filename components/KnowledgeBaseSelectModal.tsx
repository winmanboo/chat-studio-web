import React, { useState, useEffect } from 'react';
import { Modal, List, Input, Spin, message, Tag, Empty, Pagination } from 'antd';
import { SearchOutlined, DatabaseOutlined } from '@ant-design/icons';
import { getKnowledgeBasePage, KnowledgeBase, PageParams } from '@/lib/api/knowledgebase';

const { Search } = Input;

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
      // 确保records不为null，如果为null则设置为空数组
      setKnowledgeBases(response?.records || []);
      setTotal(response?.total || 0);
      setCurrentPage(page);
    } catch (error) {
      console.error('加载知识库列表失败:', error);
      message.error('加载知识库列表失败');
      // 出错时也要确保设置为空数组而不是null
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
  const handleCancel = () => {
    setSearchValue('');
    setCurrentPage(1);
    setKnowledgeBases([]);
    setTotal(0);
    onCancel();
  };

  return (
    <Modal
      title="选择知识库"
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={600}
      destroyOnClose
    >
      <div style={{ marginBottom: 16 }}>
        <Search
          placeholder="搜索知识库..."
          allowClear
          enterButton={<SearchOutlined />}
          onSearch={handleSearch}
          style={{ width: '100%' }}
        />
      </div>
      
      <Spin spinning={loading}>
        {knowledgeBases.length === 0 && !loading ? (
          <Empty 
            description="暂无知识库" 
            style={{ margin: '40px 0' }}
          />
        ) : (
          <>
            <List
              dataSource={knowledgeBases}
              renderItem={(item) => (
                <List.Item
                  key={item.id}
                  onClick={() => handleSelectKb(item)}
                  style={{
                    cursor: 'pointer',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    marginBottom: '8px',
                    border: '1px solid #f0f0f0',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f5f5f5';
                    e.currentTarget.style.borderColor = '#d9d9d9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = '#f0f0f0';
                  }}
                >
                  <List.Item.Meta
                    avatar={<DatabaseOutlined style={{ fontSize: '20px', color: '#1890ff' }} />}
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 500 }}>{item.name}</span>
                        <Tag color="blue">{item.docCount} 文档</Tag>
                      </div>
                    }
                    description={
                      <div>
                        <div style={{ marginBottom: '4px', color: '#666' }}>
                          {item.description || '暂无描述'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#999' }}>
                          创建时间: {new Date(item.createdTime).toLocaleString()}
                        </div>
                        {item.tags && item.tags.length > 0 && (
                          <div style={{ marginTop: '4px' }}>
                            {item.tags.map(tag => (
                              <Tag key={tag.id} style={{ margin: '2px 4px 2px 0', fontSize: '12px' }}>
                                {tag.name}
                              </Tag>
                            ))}
                          </div>
                        )}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
            
            {total > pageSize && (
              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <Pagination
                  current={currentPage}
                  total={total}
                  pageSize={pageSize}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                  showQuickJumper
                  showTotal={(total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`}
                />
              </div>
            )}
          </>
        )}
      </Spin>
    </Modal>
  );
};

export default KnowledgeBaseSelectModal;
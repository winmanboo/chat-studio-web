import React, { useState, useEffect } from 'react';
import { Modal, Input, Spin, message, Tag, Empty, Pagination, theme, Typography, Flex, Space } from 'antd';
import { SearchOutlined, DatabaseOutlined, CalendarOutlined, FileTextOutlined } from '@ant-design/icons';
import { getKnowledgeBasePage, KnowledgeBase, PageParams } from '@/lib/api/knowledgebase';
import classNames from 'classnames';
import styles from './KnowledgeBaseSelectModal.module.css';

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

  const cssVars = {
    '--primary-color': token.colorPrimary,
    '--primary-color-bg': token.colorPrimaryBg,
    '--border-radius-lg': `${token.borderRadiusLG}px`,
    '--border-color-secondary': token.colorBorderSecondary,
    '--bg-container': token.colorBgContainer,
    '--box-shadow': token.boxShadow,
    '--text-color': token.colorText,
    '--fill-quaternary': token.colorFillQuaternary,
    '--text-secondary': token.colorTextSecondary,
  } as any;

  return (
    <Modal
      title={
        <div className={styles.titleContainer}>
          <DatabaseOutlined style={{ color: token.colorPrimary }} />
          <span>选择知识库</span>
        </div>
      }
      open={open}
      onCancel={handleCancelModal}
      footer={null}
      width={640}
      destroyOnHidden
      centered
      styles={{
        body: { padding: '24px' }
      }}
    >
      <div className={styles.searchContainer} style={cssVars}>
        <Search
          placeholder="搜索知识库名称或描述..."
          allowClear
          enterButton={<SearchOutlined />}
          onSearch={handleSearch}
          size="large"
          className={styles.searchInput}
        />
      </div>
      
      <Spin spinning={loading}>
        {knowledgeBases.length === 0 && !loading ? (
          <Empty 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="暂无可选知识库" 
            className={styles.emptyState}
          />
        ) : (
          <div className={styles.listContainer} style={cssVars}>
            <div className={styles.scrollArea}>
              {knowledgeBases.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectKb(item)}
                  className={styles.kbItem}
                >
                  <Flex gap={16} className={styles.fullWidth} align="start">
                    {/* 图标区域 */}
                    <div
                      className={styles.iconContainer}
                    >
                      <DatabaseOutlined className={styles.icon} />
                    </div>

                    {/* 内容区域 */}
                    <div className={styles.contentContainer}>
                      <Flex justify="space-between" align="center" className={styles.itemHeader}>
                        <Text strong className={styles.itemName}>
                          {item.name}
                        </Text>
                        <Tag 
                          color="blue" 
                          icon={<FileTextOutlined />} 
                          className={styles.docCountTag}
                        >
                          {item.docCount} 文档
                        </Tag>
                      </Flex>

                      <Text 
                        type="secondary" 
                        className={classNames(styles.itemDescription, {
                          [styles.itemDescriptionEmpty]: !item.description
                        })}
                        ellipsis={{ tooltip: true }}
                      >
                        {item.description || '暂无描述信息'}
                      </Text>

                      <Flex justify="space-between" align="center">
                        <Space size={[0, 8]} wrap className={styles.tagsContainer}>
                          {item.tags && item.tags.length > 0 ? (
                            item.tags.slice(0, 3).map(tag => (
                              <Tag 
                                key={tag.id} 
                                bordered={false}
                                className={styles.tag}
                              >
                                {tag.name}
                              </Tag>
                            ))
                          ) : (
                            <span />
                          )}
                          {item.tags && item.tags.length > 3 && (
                            <Text type="secondary" className={styles.smallText}>+{item.tags.length - 3}</Text>
                          )}
                        </Space>

                        <Text type="secondary" className={styles.dateText}>
                          <CalendarOutlined />
                          {new Date(item.createdTime).toLocaleDateString()}
                        </Text>
                      </Flex>
                    </div>
                  </Flex>
                </div>
              ))}
            </div>
            
            {total > pageSize && (
              <div className={styles.paginationContainer}>
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
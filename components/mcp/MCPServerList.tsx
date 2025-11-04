'use client';

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Tag, 
  Space, 
  Button, 
  Popconfirm, 
  message, 
  Tooltip,
  Input,
  Select,
  Row,
  Col,
  Typography,
  Badge,
  Avatar,
  Empty,
  Spin
} from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  ReloadOutlined, 
  ShareAltOutlined,
  LockOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { 
  getMCPServerList, 
  deleteMCPServer, 
  refreshMCPServerState,
  MCPServer, 
  MCPServerState,
  MCPServerListParams 
} from '@/lib/api/mcp';

const { Search } = Input;
const { Option } = Select;
const { Text, Title } = Typography;

interface MCPServerListProps {
  refreshTrigger?: number;
  onRefresh?: () => void;
  onAddServer?: () => void;
}

const MCPServerList: React.FC<MCPServerListProps> = ({ refreshTrigger, onRefresh, onAddServer }) => {
  // 首次加载骨架屏，仅在初次渲染时显示
  const [initialLoading, setInitialLoading] = useState(true);
  const [servers, setServers] = useState<MCPServer[]>([]);
  const [filteredServers, setFilteredServers] = useState<MCPServer[]>([]);
  const [searchParams, setSearchParams] = useState<MCPServerListParams>({});
  const [refreshingCards, setRefreshingCards] = useState<Set<string>>(new Set());
  const [isRefreshingList, setIsRefreshingList] = useState(false);
  // 获取服务器列表
  const fetchServers = async () => {
    try {
      setIsRefreshingList(true);
      const data = await getMCPServerList(searchParams);
      setServers(data);
      setFilteredServers(data);
    } catch (error) {
      console.error('获取服务器列表失败:', error);
      message.error('获取服务器列表失败');
    } finally {
      setIsRefreshingList(false);
      // 首次加载完成后关闭骨架屏
      if (initialLoading) {
        setInitialLoading(false);
      }
    }
  };

  // 筛选服务器
  const filterServers = () => {
    let filtered = [...servers];

    // 按名称或端点搜索
    if (searchParams.serverName) {
      const keyword = searchParams.serverName.toLowerCase();
      filtered = filtered.filter(server => 
        server.serverName.toLowerCase().includes(keyword) ||
        server.endpoint.toLowerCase().includes(keyword) ||
        server.bizName.toLowerCase().includes(keyword)
      );
    }

    // 按状态筛选
    if (searchParams.state !== undefined) {
      filtered = filtered.filter(server => server.state === searchParams.state);
    }

    // 按共享状态筛选
    if (searchParams.shared !== undefined) {
      filtered = filtered.filter(server => server.shared === searchParams.shared);
    }

    setFilteredServers(filtered);
  };

  // 刷新服务器状态
  const handleRefreshState = async (bizName: string) => {
    try {
      // 将卡片添加到刷新状态
      setRefreshingCards(prev => new Set(prev).add(bizName));
      message.loading({ content: '正在刷新状态...', key: 'refresh' });
      await refreshMCPServerState(bizName);
      message.success({ content: '状态刷新成功', key: 'refresh' });
      fetchServers();
    } catch (error) {
      message.error({ content: '状态刷新失败', key: 'refresh' });
    } finally {
      // 从刷新状态中移除卡片
      setRefreshingCards(prev => {
        const newSet = new Set(prev);
        newSet.delete(bizName);
        return newSet;
      });
    }
  };

  // 删除服务器
  const handleDelete = async (bizName: string) => {
    try {
      message.loading({ content: '正在删除...', key: 'delete' });
      await deleteMCPServer(bizName);
      message.success({ content: '删除成功', key: 'delete' });
      fetchServers();
    } catch (error) {
      message.error({ content: '删除失败', key: 'delete' });
    }
  };

  // 编辑服务器
  const handleEdit = (endpoint: string) => {
    console.log('编辑服务器:', endpoint);
    // 这里应该打开编辑模态框或跳转到编辑页面
    message.info('编辑功能开发中...');
  };

  useEffect(() => {
    fetchServers();
  }, [refreshTrigger]);

  useEffect(() => {
    filterServers();
  }, [searchParams, servers]);

  // 渲染服务器卡片
  const renderServerCard = (server: MCPServer) => {
    const isRefreshing = refreshingCards.has(server.bizName);
    
    return (
      <Col xs={24} sm={12} lg={8} xl={6} key={server.endpoint}>
        <Spin spinning={isRefreshing} tip="刷新状态中...">
          <Card
            className="server-card h-full"
            hoverable
            styles={{
              body: { padding: '20px' }
            }}
            actions={[
              <Tooltip title="刷新状态" key="refresh">
                <Button
                  type="text"
                  icon={<ReloadOutlined />}
                  onClick={() => handleRefreshState(server.bizName)}
                  className="action-btn"
                  loading={isRefreshing}
                />
              </Tooltip>,
              <Tooltip title="编辑" key="edit">
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(server.endpoint)}
                  className="action-btn"
                  disabled={isRefreshing}
                />
              </Tooltip>,
              <Popconfirm
                title="确定删除此服务器吗？"
                onConfirm={() => handleDelete(server.bizName)}
                okText="确定"
                cancelText="取消"
                key="delete"
              >
                <Tooltip title="删除">
                  <Button
                    type="text"
                    icon={<DeleteOutlined />}
                    danger
                    className="action-btn"
                    disabled={isRefreshing}
                  />
                </Tooltip>
              </Popconfirm>
            ]}
          >
            {/* 卡片头部 */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <Text strong className="text-lg text-gray-900 truncate">
                    {server.serverName}
                  </Text>
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    server.state === MCPServerState.HEALTH ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                </div>
                <Text className="text-xs text-gray-500 truncate block">
                  {server.endpoint}
                </Text>
              </div>
            </div>

            {/* 业务标识 */}
            <div className="mb-3">
              <Tag color="blue" className="rounded-full px-3 py-1">
                {server.bizName}
              </Tag>
            </div>

            {/* 配置信息 */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-xs">
                <Text className="text-gray-500">超时设置</Text>
                <Text className="text-gray-700">{server.timeout}s / {server.sseTimeout}s</Text>
              </div>
              <div className="flex justify-between text-xs">
                <Text className="text-gray-500">共享状态</Text>
                <div className="flex items-center space-x-1">
                  {server.shared ? (
                    <>
                      <ShareAltOutlined className="text-blue-500" />
                      <Text className="text-blue-600">共享</Text>
                    </>
                  ) : (
                    <>
                      <LockOutlined className="text-gray-500" />
                      <Text className="text-gray-500">私有</Text>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* 描述 */}
            {server.description && (
              <div className="border-t pt-3">
                <Text className="text-xs text-gray-500 block mb-1">描述</Text>
                <Text className="text-sm text-gray-600 line-clamp-2">
                  {server.description}
                </Text>
              </div>
            )}
          </Card>
        </Spin>
      </Col>
    );
  };

  return (
    <div className="flex flex-col h-full space-y-6 overflow-hidden">
      {/* 搜索和筛选区域 */}
      <div className="space-y-4 flex-shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* 搜索框区域 */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Search
              placeholder="搜索服务器名称、端点或业务标识"
              allowClear
              size="large"
              className="search-input"
              onSearch={(value) => setSearchParams(prev => ({ ...prev, serverName: value }))}
              onChange={(e) => {
                if (!e.target.value) {
                  setSearchParams(prev => ({ ...prev, serverName: undefined }));
                }
              }}
            />
            <Select
              placeholder="筛选状态"
              allowClear
              size="large"
              className="filter-select"
              onChange={(value) => setSearchParams(prev => ({ ...prev, state: value }))}
            >
              <Option value={MCPServerState.HEALTH}>
                <div className="flex items-center space-x-2">
                  <CheckCircleOutlined className="text-green-500" />
                  <span>健康</span>
                </div>
              </Option>
              <Option value={MCPServerState.FAIL}>
                <div className="flex items-center space-x-2">
                  <ExclamationCircleOutlined className="text-red-500" />
                  <span>异常</span>
                </div>
              </Option>
            </Select>
            <Select
              placeholder="筛选共享状态"
              allowClear
              size="large"
              className="filter-select"
              onChange={(value) => setSearchParams(prev => ({ ...prev, shared: value }))}
            >
              <Option value={true}>
                <div className="flex items-center space-x-2">
                  <ShareAltOutlined className="text-blue-500" />
                  <span>共享</span>
                </div>
              </Option>
              <Option value={false}>
                <div className="flex items-center space-x-2">
                  <LockOutlined className="text-gray-500" />
                  <span>私有</span>
                </div>
              </Option>
            </Select>
          </div>
          
          {/* 按钮区域 */}
          <div className="flex items-center space-x-3 lg:flex-shrink-0">
            <Button
              icon={<ReloadOutlined />}
              onClick={() => fetchServers()}
              className="flex items-center"
              size="large"
              loading={isRefreshingList}
            >
              刷新
            </Button>
            {onAddServer && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={onAddServer}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 border-0"
                size="large"
              >
                添加服务器
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 卡片网格 - 填充剩余空间 */}
      <div className="flex-1 min-h-0 flex flex-col">
        {initialLoading ? (
          <div className="flex-1 overflow-hidden px-2">
            <Row gutter={[12, 16]} className="h-full" wrap={true}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <Col xs={24} sm={12} lg={8} xl={6} key={i}>
                  <Card loading className="h-64" />
                </Col>
              ))}
            </Row>
          </div>
        ) : filteredServers.length > 0 ? (
          <div className="flex-1 overflow-hidden px-2">
            <div className="h-full overflow-y-auto overflow-x-hidden">
              <Row gutter={[12, 16]} className="pb-4" wrap={true}>
                {filteredServers.map(renderServerCard)}
              </Row>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center min-h-96">
            <Empty
              description="暂无服务器数据"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              {onAddServer && (
                <Button type="primary" icon={<PlusOutlined />} onClick={onAddServer}>
                  添加第一个服务器
                </Button>
              )}
            </Empty>
          </div>
        )}
      </div>

      {/* 全局样式 */}
      <style jsx global>{`
        .server-card {
          border-radius: 16px;
          border: 1px solid #e5e7eb;
          transition: all 0.3s ease;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
        }
        
        .server-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          border-color: #3b82f6;
        }

        .action-btn {
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .action-btn:hover {
          background-color: #f3f4f6;
          transform: scale(1.05);
        }

        .search-input .ant-input {
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          transition: all 0.3s ease;
        }

        .search-input .ant-input:focus,
        .search-input .ant-input-focused {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .filter-select .ant-select-selector {
          border-radius: 12px !important;
          border: 1px solid #e5e7eb !important;
          transition: all 0.3s ease !important;
        }

        .filter-select .ant-select-focused .ant-select-selector {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* 自定义滚动条 */
        .flex-1.overflow-auto::-webkit-scrollbar {
          width: 6px;
        }

        .flex-1.overflow-auto::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }

        .flex-1.overflow-auto::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }

        .flex-1.overflow-auto::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        /* 加载动画优化 */
        .ant-card-loading-content p {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
        }

        @keyframes loading {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        /* 响应式优化 */
        @media (max-width: 768px) {
          .server-card {
            margin-bottom: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default MCPServerList;
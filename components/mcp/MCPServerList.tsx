'use client';

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Tag, 
  Button, 
  Popconfirm, 
  Tooltip,
  Row,
  Col,
  Typography,
  Spin,
  theme,
  Empty,
  Space,
  Badge,
  App
} from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  ReloadOutlined, 
  ShareAltOutlined,
  LockOutlined,
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

const { Text } = Typography;

export interface MCPServerListProps {
  filterParams: MCPServerListParams;
  refreshTrigger?: number;
  onAddServer?: () => void; // Keep for Empty state action
}

const MCPServerList: React.FC<MCPServerListProps> = ({ filterParams, refreshTrigger, onAddServer }) => {
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const [initialLoading, setInitialLoading] = useState(true);
  const [servers, setServers] = useState<MCPServer[]>([]);
  const [refreshingCards, setRefreshingCards] = useState<Set<string>>(new Set());

  // 获取服务器列表
  const fetchServers = async () => {
    try {
      // 如果是首次加载，不显示全屏loading，因为有骨架屏
      // 但如果是筛选变化，可能需要loading？
      // 这里简化，总是获取数据
      const data = await getMCPServerList(filterParams);
      setServers(data);
    } catch (error) {
      console.error('获取服务器列表失败:', error);
      message.error('获取服务器列表失败');
    } finally {
      if (initialLoading) {
        setInitialLoading(false);
      }
    }
  };

  // 监听筛选参数和刷新触发器
  useEffect(() => {
    fetchServers();
  }, [filterParams, refreshTrigger]);

  // 刷新服务器状态
  const handleRefreshState = async (bizName: string) => {
    try {
      setRefreshingCards(prev => new Set(prev).add(bizName));
      message.loading({ content: '正在刷新状态...', key: 'refresh' });
      await refreshMCPServerState(bizName);
      message.success({ content: '状态刷新成功', key: 'refresh' });
      fetchServers();
    } catch (error) {
      message.error({ content: '状态刷新失败', key: 'refresh' });
    } finally {
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

  const handleEdit = (endpoint: string) => {
    message.info('编辑功能开发中...');
  };

  const renderServerCard = (server: MCPServer) => {
    const isRefreshing = refreshingCards.has(server.bizName);
    const isHealth = server.state === MCPServerState.HEALTH;
    
    return (
      <Col xs={24} sm={12} lg={8} xl={6} key={server.endpoint}>
        <Spin spinning={isRefreshing} tip="刷新中...">
          <Card
            hoverable
            style={{ 
              height: '100%', 
              borderRadius: token.borderRadiusLG,
              border: `1px solid ${token.colorBorderSecondary}` 
            }}
            styles={{
              body: {
                padding: '20px'
              }
            }}
            actions={[
              <Tooltip title="刷新状态" key="refresh">
                <Button
                  type="text"
                  icon={<ReloadOutlined />}
                  onClick={() => handleRefreshState(server.bizName)}
                  loading={isRefreshing}
                />
              </Tooltip>,
              <Tooltip title="编辑" key="edit">
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(server.endpoint)}
                  disabled={isRefreshing}
                />
              </Tooltip>,
              <Popconfirm
                title="删除服务器"
                description="确定要删除此服务器吗？"
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
                    disabled={isRefreshing}
                  />
                </Tooltip>
              </Popconfirm>
            ]}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div style={{ flex: 1, overflow: 'hidden', marginRight: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                  <Text strong style={{ fontSize: 16, marginRight: 8 }} ellipsis>
                    {server.serverName}
                  </Text>
                  <Badge status={isHealth ? 'success' : 'error'} />
                </div>
                <Text type="secondary" style={{ fontSize: 12 }} ellipsis title={server.endpoint}>
                  {server.endpoint}
                </Text>
              </div>
            </div>

            {/* Tags */}
            <div style={{ marginBottom: 16 }}>
              <Tag color="blue" style={{ borderRadius: token.borderRadiusSM }}>
                {server.bizName}
              </Tag>
            </div>

            {/* Info */}
            <div style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <Text type="secondary">超时设置</Text>
                <Text>{server.timeout}s / {server.sseTimeout}s</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <Text type="secondary">共享状态</Text>
                <Space size={4}>
                  {server.shared ? (
                    <>
                      <ShareAltOutlined style={{ color: token.colorPrimary }} />
                      <Text style={{ color: token.colorPrimary }}>共享</Text>
                    </>
                  ) : (
                    <>
                      <LockOutlined style={{ color: token.colorTextSecondary }} />
                      <Text type="secondary">私有</Text>
                    </>
                  )}
                </Space>
              </div>
            </div>

            {/* Description */}
            {server.description && (
              <div style={{ 
                borderTop: `1px solid ${token.colorBorderSecondary}`, 
                paddingTop: 12, 
                marginTop: 12 
              }}>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>描述</Text>
                <Text style={{ fontSize: 13 }} ellipsis={{ tooltip: server.description }}>
                  {server.description}
                </Text>
              </div>
            )}
          </Card>
        </Spin>
      </Col>
    );
  };

  if (initialLoading) {
    return (
      <Row gutter={[16, 16]} style={{ width: '100%' }}>
        {[1, 2, 3, 4].map(i => (
          <Col xs={24} sm={12} lg={8} xl={6} key={i}>
            <Card loading style={{ borderRadius: token.borderRadiusLG }} />
          </Col>
        ))}
      </Row>
    );
  }

  if (servers.length === 0) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100%',
        minHeight: 300
      }}>
        <Empty
          description="暂无 MCP 服务器"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          {onAddServer && (
            <Button type="primary" icon={<PlusOutlined />} onClick={onAddServer}>
              添加第一个服务器
            </Button>
          )}
        </Empty>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', overflowX: 'hidden', paddingRight: 4 }}>
      <Row gutter={[16, 16]} style={{ width: '100%' }}>
        {servers.map(renderServerCard)}
      </Row>
    </div>
  );
};

export default MCPServerList;

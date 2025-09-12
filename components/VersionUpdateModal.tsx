'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Button, Typography, List, Tag, Space, Divider } from 'antd';
import { ReloadOutlined, ExportOutlined, CloseOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

interface UpdateNote {
  title?: string;
  description?: string;
  features?: string[];
  optimizations?: string[];
  bugfixes?: string[];
  releaseDate?: string;
  buildTime?: string;
  environment?: string;
  versionType?: string;
  isPrerelease?: boolean;
}

interface VersionData {
  currentVersion: string;
  newVersion: string;
  environment: string;
  updateNotes: UpdateNote;
  isPrerelease: boolean;
}

interface VersionUpdateModalProps {
  visible: boolean;
  versionData: VersionData | null;
  onClose: () => void;
  onRefresh: () => void;
  onOpenNewTab: () => void;
}

const VersionUpdateModal: React.FC<VersionUpdateModalProps> = ({
  visible,
  versionData,
  onClose,
  onRefresh,
  onOpenNewTab
}) => {
  const [loading, setLoading] = useState(false);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      // 给用户一点反馈时间
      await new Promise(resolve => setTimeout(resolve, 500));
      onRefresh();
    } finally {
      setLoading(false);
    }
  };

  const handleOpenNewTab = () => {
    onOpenNewTab();
    onClose();
  };

  if (!versionData) return null;

  const currentVersionNote = versionData.updateNotes;
  const buildDate = currentVersionNote.buildTime ? new Date(currentVersionNote.buildTime).toLocaleString('zh-CN') : '未知时间';

  return (
    <Modal
      title={
        <Space>
          <ReloadOutlined style={{ color: '#1890ff' }} />
          <span>应用更新通知</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={600}
      footer={[
        <Button key="close" onClick={onClose} icon={<CloseOutlined />}>
          稍后更新
        </Button>,
        <Button
          key="newTab"
          type="default"
          onClick={handleOpenNewTab}
          icon={<ExportOutlined />}
        >
          新窗口打开
        </Button>,
        <Button
          key="refresh"
          type="primary"
          loading={loading}
          onClick={handleRefresh}
          icon={<ReloadOutlined />}
        >
          立即刷新
        </Button>
      ]}
      maskClosable={false}
      closable={true}
    >
      <div style={{ padding: '8px 0' }}>
        {/* 版本信息头部 */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
            🎉 新版本 {versionData.newVersion} 已发布！
          </Title>
          <Text type="secondary" style={{ fontSize: '14px' }}>
            发布时间: {buildDate}
          </Text>
        </div>

        {currentVersionNote && (
          <>
            {/* 更新标题和描述 */}
            <div style={{ marginBottom: 16 }}>
              <Title level={4} style={{ marginBottom: 8 }}>
                {currentVersionNote.title}
              </Title>
              <Paragraph style={{ marginBottom: 0, color: '#666' }}>
                {currentVersionNote.description}
              </Paragraph>
            </div>

            <Divider style={{ margin: '16px 0' }} />

            {/* 更新内容列表 */}
            <div style={{ marginBottom: 16 }}>
              {/* 新功能 */}
              {currentVersionNote.features && currentVersionNote.features.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <Title level={5} style={{ marginBottom: 12, color: '#52c41a' }}>
                    ✨ 新功能特性
                  </Title>
                  <List
                    size="small"
                    dataSource={currentVersionNote.features}
                    renderItem={(feature: string) => (
                      <List.Item style={{ padding: '6px 0', border: 'none' }}>
                        <Text style={{ fontSize: '14px' }}>{feature}</Text>
                      </List.Item>
                    )}
                  />
                </div>
              )}

              {/* 性能优化 */}
              {currentVersionNote.optimizations && currentVersionNote.optimizations.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <Title level={5} style={{ marginBottom: 12, color: '#1890ff' }}>
                    ⚡ 性能优化
                  </Title>
                  <List
                    size="small"
                    dataSource={currentVersionNote.optimizations}
                    renderItem={(optimization: string) => (
                      <List.Item style={{ padding: '6px 0', border: 'none' }}>
                        <Text style={{ fontSize: '14px' }}>{optimization}</Text>
                      </List.Item>
                    )}
                  />
                </div>
              )}

              {/* 问题修复 */}
              {currentVersionNote.bugfixes && currentVersionNote.bugfixes.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <Title level={5} style={{ marginBottom: 12, color: '#fa8c16' }}>
                    🐛 问题修复
                  </Title>
                  <List
                    size="small"
                    dataSource={currentVersionNote.bugfixes}
                    renderItem={(bugfix: string) => (
                      <List.Item style={{ padding: '6px 0', border: 'none' }}>
                        <Text style={{ fontSize: '14px' }}>{bugfix}</Text>
                      </List.Item>
                    )}
                  />
                </div>
              )}
            </div>

            <Divider style={{ margin: '16px 0' }} />

            {/* 操作提示 */}
            <div style={{ 
              background: '#f6ffed', 
              border: '1px solid #b7eb8f', 
              borderRadius: '6px', 
              padding: '12px',
              marginTop: 16
            }}>
              <Text style={{ color: '#389e0d', fontSize: '14px' }}>
                💡 <strong>建议操作:</strong> 点击"立即刷新"来体验新功能，或者"新窗口打开"在新标签页中使用新版本。
              </Text>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default VersionUpdateModal;
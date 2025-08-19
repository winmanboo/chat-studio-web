"use client";

import React from 'react';
import { Card, Button, Upload, Table, Tag, Space, Input } from 'antd';
import { PlusOutlined, FileTextOutlined, DeleteOutlined } from '@ant-design/icons';

const { Search } = Input;

const KnowledgeBasePage: React.FC = () => {
  // 知识库文档假数据
  const documents = [
    {
      id: '1',
      title: 'RAG应用开发指南',
      type: 'PDF',
      size: '2.3MB',
      uploadTime: '2024-08-06',
      tags: ['开发指南', 'RAG'],
    },
    {
      id: '2',
      title: 'AI对话系统设计',
      type: 'DOCX',
      size: '1.8MB',
      uploadTime: '2024-08-05',
      tags: ['系统设计', 'AI'],
    },
    {
      id: '3',
      title: '知识库管理规范',
      type: 'PDF',
      size: '0.9MB',
      uploadTime: '2024-08-04',
      tags: ['规范', '管理'],
    },
  ];

  const columns = [
    {
      title: '文档名称',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => (
        <Space>
          <FileTextOutlined style={{ color: '#1890ff' }} />
          {text}
        </Space>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
    },
    {
      title: '上传时间',
      dataIndex: 'uploadTime',
      key: 'uploadTime',
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags: string[]) => (
        <>
          {tags.map(tag => (
            <Tag key={tag} color="green">{tag}</Tag>
          ))}
        </>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Space size="middle">
          <Button type="link" size="small">查看</Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ height: '100vh', width: '100%', background: '#fff', color: '#222', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 24, flexShrink: 0 }}>
        <h2 style={{ marginBottom: 16, color: '#222' }}>知识库管理</h2>
        <Space style={{ marginBottom: 16 }}>
          <Upload>
            <Button icon={<PlusOutlined />} type="primary">
              上传文档
            </Button>
          </Upload>
          <Search
            placeholder="搜索文档"
            allowClear
            style={{ width: 300 }}
            onSearch={(value) => console.log('搜索:', value)}
          />
        </Space>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 24px' }}>
        <Card style={{ borderRadius: 12, color: '#222' }}>
          <Table
            columns={columns}
            dataSource={documents}
            rowKey="id"
            pagination={{
              total: documents.length,
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
            }}
            style={{ color: '#222' }}
          />
        </Card>
      </div>
    </div>
  );
};

export default KnowledgeBasePage;
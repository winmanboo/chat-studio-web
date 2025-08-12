"use client";

import React from 'react';
import { Card, Row, Col, Button, Tag, Rate, Space, Input } from 'antd';
import { ShoppingCartOutlined, DownloadOutlined, EyeOutlined } from '@ant-design/icons';

const { Search } = Input;

const MarketPage: React.FC = () => {
  // 市场应用假数据
  const applications = [
    {
      id: '1',
      name: '智能客服助手',
      description: '基于大语言模型的智能客服系统，支持多轮对话和知识库检索',
      price: '免费',
      rating: 4.8,
      downloads: 1234,
      tags: ['客服', 'AI对话', '免费'],
      avatar: '🤖',
    },
    {
      id: '2',
      name: '文档智能分析',
      description: '自动分析PDF、Word等文档，提取关键信息并生成摘要',
      price: '￥99/月',
      rating: 4.6,
      downloads: 856,
      tags: ['文档分析', 'AI', '付费'],
      avatar: '📄',
    },
    {
      id: '3',
      name: '代码助手Pro',
      description: '智能代码补全和重构建议，支持多种编程语言',
      price: '￥199/月',
      rating: 4.9,
      downloads: 2341,
      tags: ['编程', '代码助手', '付费'],
      avatar: '💻',
    },
    {
      id: '4',
      name: '多语言翻译器',
      description: '支持100+语言的实时翻译，准确率高达95%',
      price: '免费',
      rating: 4.7,
      downloads: 5678,
      tags: ['翻译', '多语言', '免费'],
      avatar: '🌐',
    },
  ];

  return (
    <div style={{ height: '100vh', width: '100%', background: '#fff', color: '#222', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 24, flexShrink: 0 }}>
        <h2 style={{ marginBottom: 16, color: '#222' }}>AI应用市场</h2>
        <Search
          placeholder="搜索应用..."
          allowClear
          style={{ width: 400 }}
          onSearch={(value) => console.log('搜索:', value)}
        />
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 24px' }}>
        <Row gutter={[16, 16]} style={{ margin: 0 }}>
        {applications.map(app => (
          <Col xs={24} sm={12} lg={8} xl={6} key={app.id}>
            <Card
              hoverable
              style={{ color: '#222' }}
              cover={
                <div style={{ 
                  height: 120, 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 48
                }}>
                  {app.avatar}
                </div>
              }
              actions={[
                <Button key="preview" type="link" icon={<EyeOutlined />}>预览</Button>,
                <Button key="buy" type="link" icon={<ShoppingCartOutlined />}>购买</Button>,
                <Button key="download" type="link" icon={<DownloadOutlined />}>下载</Button>,
              ]}
            >
              <Card.Meta
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{app.name}</span>
                    <Tag color={app.price === '免费' ? 'green' : 'orange'}>
                      {app.price}
                    </Tag>
                  </div>
                }
                description={
                  <div>
                    <p style={{ color: '#666', marginBottom: 8 }}>{app.description}</p>
                    <Space style={{ marginBottom: 8 }}>
                      <Rate disabled defaultValue={app.rating} />
                      <span style={{ fontSize: 12, color: '#999' }}>
                        {app.rating}
                      </span>
                    </Space>
                    <div style={{ marginBottom: 8 }}>
                      {app.tags.map(tag => (
                        <Tag key={tag}>{tag}</Tag>
                      ))}
                    </div>
                    <div style={{ fontSize: 12, color: '#999' }}>
                      {app.downloads} 次下载
                    </div>
                  </div>
                }
              />
            </Card>
          </Col>
        ))}
        </Row>
      </div>
    </div>
  );
};

export default MarketPage;
'use client';

import React from 'react';
import { Card, Typography, Statistic, Row, Col } from 'antd';

const { Title, Text } = Typography;

interface DashboardPanelProps {
  // 可以根据需要添加props来传递数据
}

const DashboardPanel: React.FC<DashboardPanelProps> = () => {
  return (
    <div>
      <Title level={3}>系统概览</Title>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic title="总用户数" value={1128} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="活跃用户" value={892} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="今日新增" value={23} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="系统负载" value={68} suffix="%" />
          </Card>
        </Col>
      </Row>
      <Card title="最近活动">
        <Text type="secondary">系统运行正常，所有服务状态良好。</Text>
      </Card>
    </div>
  );
};

export default DashboardPanel;
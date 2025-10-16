'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Card, Typography, Statistic, Row, Col, Spin, message, DatePicker, Button, Select, Space, Empty } from 'antd';
import { ReloadOutlined, PlayCircleOutlined, PauseCircleOutlined } from '@ant-design/icons';
import TimeRangeSelector from './TimeRangeSelector';
import dayjs, { Dayjs } from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import localeData from 'dayjs/plugin/localeData';

// 配置 dayjs 插件
dayjs.extend(weekday);
dayjs.extend(localeData);
import dynamic from 'next/dynamic';
import { getMonitorData, MonitorDataResponse, MonitorQueryParams } from '../../lib/api/monitor';
import { 
  convertToTimeSeriesData, 
  convertToPieData, 
  convertToUserRankingData,
  createTimeSeriesOption, 
  createPieOption, 
  createBarOption 
} from '../../lib/utils/monitorUtils';

// 动态导入ReactECharts组件，禁用SSR
const ReactECharts = dynamic(() => import('echarts-for-react'), {
  ssr: false,
  loading: () => <Spin size="large" />
});

const { Title, Text } = Typography;

interface DashboardPanelProps {
  // 可以根据需要添加props来传递数据
}

const DashboardPanel: React.FC<DashboardPanelProps> = () => {
  const [monitorData, setMonitorData] = useState<MonitorDataResponse | null>(null);
  const [loading, setLoading] = useState(true); // 初始加载状态
  const [refreshLoading, setRefreshLoading] = useState(false); // 刷新按钮loading状态
  
  // 时间范围状态
  const [timeRange, setTimeRange] = useState<[Dayjs, Dayjs]>(() => {
    const now = dayjs();
    const sixHoursAgo = now.subtract(6, 'hour');
    return [sixHoursAgo, now];
  });
  
  // 刷新控制状态
  const [refreshInterval, setRefreshInterval] = useState<number>(5); // 秒
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);



  // 获取监控数据
  const fetchMonitorData = useCallback(async (from?: Dayjs, to?: Dayjs, isAutoRefresh = false, isManualRefresh = false) => {
    try {
      // 初始加载显示全局loading，手动刷新显示按钮loading，自动刷新不显示loading
      if (loading && !monitorData) {
        // 初始加载，保持全局loading
      } else if (isManualRefresh) {
        setRefreshLoading(true);
      }
      
      const startTime = from || timeRange[0];
      const endTime = to || timeRange[1];
      
      const params: MonitorQueryParams = {
        from: startTime.valueOf(), // 转换为毫秒时间戳
        to: endTime.valueOf()
      };
      
      const data = await getMonitorData(params);
      setMonitorData(data);
    } catch (error) {
      console.error('获取监控数据失败:', error);
      message.error('获取监控数据失败');
    } finally {
      // 初始加载完成后关闭全局loading
      if (loading && !monitorData) {
        setLoading(false);
      }
      // 手动刷新完成后关闭按钮loading
      if (isManualRefresh) {
        setRefreshLoading(false);
      }
    }
  }, [timeRange, loading, monitorData]);

  // 手动刷新
  const handleManualRefresh = () => {
    fetchMonitorData(undefined, undefined, false, true);
  };

  // 切换自动刷新
  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
  };

  // 时间范围改变处理
  const handleTimeRangeChange = (dates: [Dayjs, Dayjs]) => {
    if (dates && dates[0] && dates[1]) {
      setTimeRange([dates[0], dates[1]]);
      fetchMonitorData(dates[0], dates[1], false, true);
    }
  };

  // 刷新间隔改变处理
  const handleRefreshIntervalChange = (value: number) => {
    setRefreshInterval(value);
  };

  // 设置自动刷新定时器
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const id = setInterval(() => {
        fetchMonitorData(undefined, undefined, true); // 标记为自动刷新
      }, refreshInterval * 1000);
      setIntervalId(id);
      
      return () => {
        if (id) clearInterval(id);
      };
    } else {
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
    }
  }, [autoRefresh, refreshInterval, fetchMonitorData]);

  // 初始化数据加载
  useEffect(() => {
    fetchMonitorData();
  }, []);

  // 生成图表配置
  const getChartOptions = () => {
    if (!monitorData) {
      return {};
    }

    const options: { [key: string]: any } = {};

    // A: Token使用总量 - 时间序列图
    if (monitorData.results.A?.frames) {
      const seriesData = convertToTimeSeriesData(monitorData.results.A.frames);
      options.tokenTotal = createTimeSeriesOption('Token使用总量', seriesData);
    }

    // B: Token输入总量 - 时间序列图
    if (monitorData.results.B?.frames) {
      const seriesData = convertToTimeSeriesData(monitorData.results.B.frames);
      options.tokenInput = createTimeSeriesOption('Token输入总量', seriesData);
    }

    // C: Token输出总量 - 时间序列图
    if (monitorData.results.C?.frames) {
      const seriesData = convertToTimeSeriesData(monitorData.results.C.frames);
      options.tokenOutput = createTimeSeriesOption('Token输出总量', seriesData);
    }

    // D: 用户活跃数 - 时间序列图
    if (monitorData.results.D?.frames) {
      const seriesData = convertToTimeSeriesData(monitorData.results.D.frames);
      options.activeUsers = createTimeSeriesOption('用户活跃数', seriesData);
    }

    // E: 用户Token消耗排行 - 柱状图
    if (monitorData.results.E?.frames) {
      const rankingData = convertToUserRankingData(monitorData.results.E.frames);
      options.userRanking = createBarOption('用户Token消耗排行', rankingData);
    }

    // F: Token使用分布 - 饼图
    if (monitorData.results.F?.frames) {
      const pieData = convertToPieData(monitorData.results.F.frames);
      options.tokenDistribution = createPieOption('Token使用分布', pieData);
    }

    return options;
  };

  const chartOptions = getChartOptions();

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

      {/* 监控数据控制面板 */}
      <Card style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space size="middle">
              <span>时间范围:</span>
              <TimeRangeSelector
                value={timeRange}
                onChange={(dates) => handleTimeRangeChange(dates)}
                style={{ width: 250 }}
              />
            </Space>
          </Col>
          <Col>
            <Space size="middle">
              <span>刷新间隔:</span>
              <Select
                value={refreshInterval}
                onChange={handleRefreshIntervalChange}
                style={{ width: 100 }}
                options={[
                  { label: '5秒', value: 5 },
                  { label: '10秒', value: 10 },
                  { label: '30秒', value: 30 },
                  { label: '60秒', value: 60 },
                  { label: '5分钟', value: 300 },
                ]}
              />
              <Button
                type={autoRefresh ? "primary" : "default"}
                icon={autoRefresh ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                onClick={toggleAutoRefresh}
              >
                {autoRefresh ? '暂停' : '开始'}
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleManualRefresh}
                loading={refreshLoading}
                disabled={refreshLoading}
              >
                刷新
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 监控数据图表 */}
      <Title level={4} style={{ marginBottom: 16 }}>监控数据</Title>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>加载监控数据中...</div>
        </div>
      ) : (
        <Row gutter={16}>
          {/* Token使用总量 */}
          <Col span={12} style={{ marginBottom: 16 }}>
            <Card title="Token使用总量">
              {chartOptions.tokenTotal ? (
                <ReactECharts 
                  option={chartOptions.tokenTotal} 
                  style={{ height: '300px' }}
                  opts={{ renderer: 'canvas' }}
                />
              ) : (
                <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Empty 
                    description="No Data" 
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                </div>
              )}
            </Card>
          </Col>

          {/* Token输入总量 */}
          <Col span={12} style={{ marginBottom: 16 }}>
            <Card title="Token输入总量">
              {chartOptions.tokenInput ? (
                <ReactECharts 
                  option={chartOptions.tokenInput} 
                  style={{ height: '300px' }}
                  opts={{ renderer: 'canvas' }}
                />
              ) : (
                <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Empty 
                    description="No Data" 
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                </div>
              )}
            </Card>
          </Col>

          {/* Token输出总量 */}
          <Col span={12} style={{ marginBottom: 16 }}>
            <Card title="Token输出总量">
              {chartOptions.tokenOutput ? (
                <ReactECharts 
                  option={chartOptions.tokenOutput} 
                  style={{ height: '300px' }}
                  opts={{ renderer: 'canvas' }}
                />
              ) : (
                <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Empty 
                    description="No Data" 
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                </div>
              )}
            </Card>
          </Col>

          {/* 用户活跃数 */}
          <Col span={12} style={{ marginBottom: 16 }}>
            <Card title="用户活跃数">
              {chartOptions.activeUsers ? (
                <ReactECharts 
                  option={chartOptions.activeUsers} 
                  style={{ height: '300px' }}
                  opts={{ renderer: 'canvas' }}
                />
              ) : (
                <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Empty 
                    description="No Data" 
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                </div>
              )}
            </Card>
          </Col>

          {/* 用户Token消耗排行 */}
          <Col span={12} style={{ marginBottom: 16 }}>
            <Card title="用户Token消耗排行">
              {chartOptions.userRanking ? (
                <ReactECharts 
                  option={chartOptions.userRanking} 
                  style={{ height: '300px' }}
                  opts={{ renderer: 'canvas' }}
                />
              ) : (
                <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Empty 
                    description="No Data" 
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                </div>
              )}
            </Card>
          </Col>

          {/* Token使用分布 */}
          <Col span={12} style={{ marginBottom: 16 }}>
            <Card title="Token使用分布">
              {chartOptions.tokenDistribution ? (
                <ReactECharts 
                  option={chartOptions.tokenDistribution} 
                  style={{ height: '300px' }}
                  opts={{ renderer: 'canvas' }}
                />
              ) : (
                <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Empty 
                    description="No Data" 
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                </div>
              )}
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default DashboardPanel;
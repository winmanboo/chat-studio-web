'use client';

import React, { useState, useRef } from 'react';
import { Button, Dropdown, DatePicker, Space, Divider, Typography } from 'antd';
import { CalendarOutlined, DownOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';

const { Text } = Typography;

interface TimeRangeSelectorProps {
  value: [Dayjs, Dayjs];
  onChange: (dates: [Dayjs, Dayjs]) => void;
  style?: React.CSSProperties;
}

interface PresetRange {
  label: string;
  value: () => [Dayjs, Dayjs];
}

const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({ value, onChange, style }) => {
  const [open, setOpen] = useState(false);
  const [customFromDate, setCustomFromDate] = useState<Dayjs>(value[0]);
  const [customToDate, setCustomToDate] = useState<Dayjs>(value[1]);

  // 预设时间范围
  const presetRanges: PresetRange[] = [
    {
      label: '过去5分钟',
      value: () => [dayjs().subtract(5, 'minute'), dayjs()]
    },
    {
      label: '过去15分钟',
      value: () => [dayjs().subtract(15, 'minute'), dayjs()]
    },
    {
      label: '过去30分钟',
      value: () => [dayjs().subtract(30, 'minute'), dayjs()]
    },
    {
      label: '过去1小时',
      value: () => [dayjs().subtract(1, 'hour'), dayjs()]
    },
    {
      label: '过去3小时',
      value: () => [dayjs().subtract(3, 'hour'), dayjs()]
    },
    {
      label: '过去6小时',
      value: () => [dayjs().subtract(6, 'hour'), dayjs()]
    },
    {
      label: '过去12小时',
      value: () => [dayjs().subtract(12, 'hour'), dayjs()]
    },
    {
      label: '过去24小时',
      value: () => [dayjs().subtract(24, 'hour'), dayjs()]
    },
    {
      label: '过去3天',
      value: () => [dayjs().subtract(3, 'day'), dayjs()]
    },
    {
      label: '过去7天',
      value: () => [dayjs().subtract(7, 'day'), dayjs()]
    }
  ];

  // 处理预设范围选择
  const handlePresetSelect = (range: PresetRange) => {
    const [from, to] = range.value();
    onChange([from, to]);
    setCustomFromDate(from);
    setCustomToDate(to);
    setOpen(false);
  };

  // 处理自定义日期应用
  const handleCustomApply = () => {
    if (customFromDate && customToDate) {
      onChange([customFromDate, customToDate]);
      setOpen(false);
    }
  };

  // 格式化显示文本
  const formatDisplayText = (dates: [Dayjs, Dayjs]) => {
    const [from, to] = dates;
    const now = dayjs();
    
    // 检查是否匹配预设范围
    for (const preset of presetRanges) {
      const [presetFrom, presetTo] = preset.value();
      if (Math.abs(from.diff(presetFrom, 'minute')) <= 1 && Math.abs(to.diff(presetTo, 'minute')) <= 1) {
        return preset.label;
      }
    }
    
    // 自定义范围显示
    const fromStr = from.format('MM-DD HH:mm');
    const toStr = to.format('MM-DD HH:mm');
    return `${fromStr} 至 ${toStr}`;
  };

  // 下拉菜单内容
  const dropdownContent = (
    <div style={{ padding: '12px', minWidth: '320px', backgroundColor: 'white', borderRadius: '6px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' }}>
      {/* 预设范围 */}
      <div style={{ marginBottom: '12px' }}>
        <Text strong style={{ fontSize: '14px', color: '#666' }}>快速选择</Text>
        <div style={{ marginTop: '8px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
          {presetRanges.map((range, index) => (
            <Button
              key={index}
              type="text"
              size="small"
              onClick={() => handlePresetSelect(range)}
              style={{
                textAlign: 'left',
                height: '28px',
                padding: '4px 8px',
                fontSize: '12px',
                border: 'none',
                borderRadius: '4px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f5f5f5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {range.label}
            </Button>
          ))}
        </div>
      </div>

      <Divider style={{ margin: '12px 0' }} />

      {/* 自定义范围 */}
      <div>
        <Text strong style={{ fontSize: '14px', color: '#666' }}>自定义范围</Text>
        <div style={{ marginTop: '8px' }}>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <div>
              <Text style={{ fontSize: '12px', color: '#999' }}>开始时间</Text>
              <DatePicker
                value={customFromDate}
                onChange={(date) => setCustomFromDate(date!)}
                showTime
                format="YYYY-MM-DD HH:mm:ss"
                style={{ width: '100%', marginTop: '4px' }}
                size="small"
              />
            </div>
            <div>
              <Text style={{ fontSize: '12px', color: '#999' }}>结束时间</Text>
              <DatePicker
                value={customToDate}
                onChange={(date) => setCustomToDate(date!)}
                showTime
                format="YYYY-MM-DD HH:mm:ss"
                style={{ width: '100%', marginTop: '4px' }}
                size="small"
              />
            </div>
            <Button
              type="primary"
              size="small"
              onClick={handleCustomApply}
              style={{ width: '100%', marginTop: '8px' }}
              disabled={!customFromDate || !customToDate || customFromDate.isAfter(customToDate)}
            >
              应用
            </Button>
          </Space>
        </div>
      </div>
    </div>
  );

  return (
    <Dropdown
      open={open}
      onOpenChange={setOpen}
      dropdownRender={() => dropdownContent}
      trigger={['click']}
      placement="bottomLeft"
    >
      <Button
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minWidth: '200px',
          textAlign: 'left',
          ...style
        }}
      >
        <Space>
          <CalendarOutlined />
          <span>{formatDisplayText(value)}</span>
        </Space>
        <DownOutlined style={{ fontSize: '12px', color: '#999' }} />
      </Button>
    </Dropdown>
  );
};

export default TimeRangeSelector;
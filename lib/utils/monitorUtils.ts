import { MonitorDataResponse, MonitorFrame } from '../api/monitor';

// ECharts数据格式
export interface EChartsSeriesData {
  name: string;
  type: string;
  data: Array<[string | number, number]>;
}

export interface EChartsOption {
  title: {
    text: string;
    left: string;
    textStyle?: {
      color?: string;
      fontSize?: number;
    };
  };
  tooltip: {
    trigger: string;
    axisPointer?: {
      type: string;
      lineStyle?: {
        color?: string;
        type?: string;
      };
    };
    backgroundColor?: string;
    borderColor?: string;
    textStyle?: {
      color?: string;
    };
    formatter?: (params: any) => string;
  };
  legend?: {
    data: string[];
    textStyle?: {
      color?: string;
    };
  };
  grid: {
    left: string;
    right: string;
    bottom: string;
    containLabel: boolean;
    show?: boolean;
  };
  xAxis: {
    type: string;
    boundaryGap?: boolean;
    axisLine?: {
      show?: boolean;
    };
    axisTick?: {
      show?: boolean;
    };
    axisLabel?: {
      color?: string;
    };
    splitLine?: {
      show?: boolean;
    };
  };
  yAxis: {
    type: string;
    axisLine?: {
      show?: boolean;
    };
    axisTick?: {
      show?: boolean;
    };
    axisLabel?: {
      color?: string;
      formatter?: (value: number) => string;
    };
    splitLine?: {
      show?: boolean;
      lineStyle?: {
        color?: string;
        type?: string;
      };
    };
    min?: number;
    scale?: boolean;
  };
  series: any[];
}

/**
 * 将Grafana JSON-Arrow格式转换为ECharts时间序列数据
 */
export const convertToTimeSeriesData = (frames: MonitorFrame[]): EChartsSeriesData[] => {
  const seriesData: EChartsSeriesData[] = [];

  frames.forEach(frame => {
    const { schema, data } = frame;
    const { fields } = schema;
    
    // 检查是否有有效的字段和数据
    if (!fields || fields.length === 0 || !data || !data.values || data.values.length === 0) {
      return;
    }
    
    // 找到时间字段和数值字段
    const timeFieldIndex = fields.findIndex(field => field.type === 'time');
    const valueFields = fields.filter((field, index) => field.type === 'number' && index !== timeFieldIndex);
    
    if (timeFieldIndex === -1) {
      return;
    }
    
    if (valueFields.length === 0) {
      return;
    }
    
    valueFields.forEach((valueField, valueIndex) => {
      const actualValueIndex = fields.findIndex(field => field === valueField);
      const timeValues = data.values[timeFieldIndex] || [];
      const dataValues = data.values[actualValueIndex] || [];
      
      if (timeValues.length === 0 || dataValues.length === 0) {
        return;
      }
      
      const chartData: Array<[number, number]> = [];
      for (let i = 0; i < Math.min(timeValues.length, dataValues.length); i++) {
        // 处理时间戳，确保是数字格式
        let timestamp: number;
        if (typeof timeValues[i] === 'number') {
          timestamp = timeValues[i];
        } else {
          timestamp = new Date(timeValues[i]).getTime();
        }
        
        // 处理数值，确保是数字格式
        const value = Number(dataValues[i]) || 0;
        chartData.push([timestamp, value]);
      }
      
      // 按时间排序
      chartData.sort((a, b) => a[0] - b[0]);
      
      const seriesName = valueField.config?.displayNameFromDS || 
                        valueField.labels?.model || 
                        valueField.name || 
                        `Series ${valueIndex + 1}`;
      
      seriesData.push({
        name: seriesName,
        type: 'line',
        data: chartData
      });
    });
  });

  return seriesData;
};

/**
 * 将Grafana数据转换为饼图数据
 */
export const convertToPieData = (frames: MonitorFrame[]): Array<{name: string, value: number}> => {
  const pieData: Array<{name: string, value: number}> = [];
  
  frames.forEach(frame => {
    const { schema, data } = frame;
    const { fields } = schema;
    
    const valueField = fields.find(field => field.type === 'number');
    if (!valueField) return;
    
    const valueIndex = fields.findIndex(field => field === valueField);
    const values = data.values[valueIndex] || [];
    
    // 取最新的值
    const latestValue = values[values.length - 1] || 0;
    const name = valueField.config?.displayNameFromDS || valueField.labels?.model || 'Unknown';
    
    pieData.push({
      name,
      value: latestValue
    });
  });
  
  return pieData;
};

/**
 * 将Grafana数据转换为用户排行数据
 */
export const convertToUserRankingData = (frames: MonitorFrame[]): Array<{name: string, value: number}> => {
  const rankingData: Array<{name: string, value: number}> = [];
  
  frames.forEach(frame => {
    const { schema, data } = frame;
    const { fields } = schema;
    
    const valueField = fields.find(field => field.type === 'number');
    if (!valueField) return;
    
    const valueIndex = fields.findIndex(field => field === valueField);
    const values = data.values[valueIndex] || [];
    
    // 取最新的值
    const latestValue = values[values.length - 1] || 0;
    
    // 优先使用userId标签，如果没有则使用displayNameFromDS
    let name = 'Unknown';
    if (valueField.labels?.userId) {
      name = `用户 ${valueField.labels.userId}`;
    } else if (valueField.config?.displayNameFromDS) {
      name = valueField.config.displayNameFromDS;
    }
    
    rankingData.push({
      name,
      value: latestValue
    });
  });
  
  // 按值降序排序
  return rankingData.sort((a, b) => b.value - a.value);
};

/**
 * 创建时间序列图表配置
 */
export const createTimeSeriesOption = (title: string, seriesData: EChartsSeriesData[]): EChartsOption => {
  // 为面积图添加样式配置
  const styledSeriesData = seriesData.map((series, index) => ({
    ...series,
    type: 'line',
    smooth: true,
    areaStyle: {
      color: {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [
          {
            offset: 0,
            color: 'rgba(76, 175, 80, 0.8)' // 绿色渐变起始
          },
          {
            offset: 1,
            color: 'rgba(76, 175, 80, 0.1)' // 绿色渐变结束
          }
        ]
      }
    },
    lineStyle: {
      color: '#4CAF50',
      width: 2
    },
    itemStyle: {
      color: '#4CAF50'
    }
  }));

  return {
    title: {
      text: title,
      left: 'center',
      textStyle: {
        color: '#333',
        fontSize: 16
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'line',
        lineStyle: {
          color: '#4CAF50',
          type: 'dashed'
        }
      },
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#4CAF50',
      textStyle: {
        color: '#333'
      },
      formatter: (params: any) => {
        if (!Array.isArray(params)) params = [params];
        
        const time = new Date(params[0].value[0]).toLocaleString('zh-CN');
        let content = `<div style="margin-bottom: 4px; font-weight: bold;">${time}</div>`;
        
        params.forEach((param: any) => {
          const value = param.value[1];
          const formattedValue = value >= 1000 ? value.toLocaleString() : value.toString();
          content += `<div style="margin: 2px 0;">
            <span style="display: inline-block; width: 10px; height: 10px; background-color: ${param.color}; border-radius: 50%; margin-right: 8px;"></span>
            ${param.seriesName}: <strong>${formattedValue}</strong>
          </div>`;
        });
        
        return content;
      }
    },
    legend: {
      data: seriesData.map(s => s.name),
      textStyle: {
        color: '#666'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
      show: false // 隐藏网格背景
    },
    xAxis: {
      type: 'time',
      boundaryGap: false,
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: '#666'
      },
      splitLine: {
        show: false
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: '#666',
        formatter: (value: number) => {
          // 格式化Y轴标签，对于大数值使用K、M等单位
          if (value >= 1000000) {
            return (value / 1000000).toFixed(1) + 'M';
          } else if (value >= 1000) {
            return (value / 1000).toFixed(1) + 'K';
          }
          return value.toString();
        }
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: '#f0f0f0',
          type: 'dashed'
        }
      },
      // 确保Y轴从0开始，并根据数据自动调整最大值
      min: 0,
      scale: true
    },
    series: styledSeriesData
  };
};

/**
 * 创建饼图配置
 */
export const createPieOption = (title: string, data: Array<{name: string, value: number}>): any => {
  return {
    title: {
      text: title,
      left: 'center'
    },
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: title,
        type: 'pie',
        radius: '50%',
        data: data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };
};

/**
 * 创建柱状图配置
 */
export const createBarOption = (title: string, data: Array<{name: string, value: number}>): any => {
  return {
    title: {
      text: title,
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.name)
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: title,
        type: 'bar',
        data: data.map(item => item.value)
      }
    ]
  };
};
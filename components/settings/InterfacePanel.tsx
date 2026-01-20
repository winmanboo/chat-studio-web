import React from 'react';
import { Space, Switch, Typography, Select } from 'antd';
import { MoonOutlined } from '@ant-design/icons';
import styles from './SettingsCommon.module.css';

const { Title, Text } = Typography;
const { Option } = Select;

const InterfacePanel: React.FC = () => {
  return (
    <div>
      <Title level={4} className={styles.panelTitle}>界面设置</Title>
      <Space direction="vertical" className={styles.section} size="large">
        <div>
          <div className={styles.labelContainer}>主题</div>
          <Select defaultValue="system" className={styles.selectWidth}>
            <Option value="light">浅色</Option>
            <Option value="dark">深色</Option>
            <Option value="system">跟随系统</Option>
          </Select>
        </div>
        <div>
          <div className={styles.labelContainer}>语言</div>
          <Select defaultValue="zh-CN" className={styles.selectWidth}>
            <Option value="zh-CN">简体中文</Option>
            <Option value="en-US">English</Option>
          </Select>
        </div>
        <div className={styles.row}>
          <div>
            <div className={styles.rowLabel}>
              <MoonOutlined className={styles.rowIcon} />
              深色模式
            </div>
            <Text type="secondary" className={styles.rowDescription}>启用深色主题界面</Text>
          </div>
          <Switch />
        </div>
      </Space>
    </div>
  );
};

export default InterfacePanel;

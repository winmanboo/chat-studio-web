import React from 'react';
import { Space, Switch, Typography } from 'antd';
import { BellOutlined, SaveOutlined } from '@ant-design/icons';
import styles from './SettingsCommon.module.css';

const { Title, Text } = Typography;

const GeneralPanel: React.FC = () => {
  return (
    <div>
      <Title level={4} className={styles.panelTitle}>通用设置</Title>
      <Space direction="vertical" className={styles.section} size="large">
        <div className={styles.row}>
          <div>
            <div className={styles.rowLabel}>
              <BellOutlined className={styles.rowIcon} />
              桌面通知
            </div>
            <Text type="secondary" className={styles.rowDescription}>接收新消息时显示桌面通知</Text>
          </div>
          <Switch defaultChecked />
        </div>
        <div className={styles.row}>
          <div>
            <div className={styles.rowLabel}>
              <SaveOutlined className={styles.rowIcon} />
              自动保存对话
            </div>
            <Text type="secondary" className={styles.rowDescription}>自动保存对话历史记录</Text>
          </div>
          <Switch defaultChecked />
        </div>
      </Space>
    </div>
  );
};

export default GeneralPanel;

import React, { useRef, useEffect } from 'react';
import { Button, Space, Tooltip, message } from 'antd';
import { CloseOutlined, CopyOutlined, DownloadOutlined, FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons';
import styles from './PreviewPanel.module.css';

interface PreviewPanelProps {
  content: string;
  onClose: () => void;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ content, onClose }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [iframeKey, setIframeKey] = React.useState(0);

  useEffect(() => {
    setIframeKey((prev) => prev + 1);
  }, [content]);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    message.success('已复制到剪贴板');
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'preview.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
          setIsFullscreen(true);
      }).catch(err => {
        message.error(`无法进入全屏模式: ${err.message}`);
      });
    } else {
      document.exitFullscreen().then(() => {
          setIsFullscreen(false);
      });
    }
  };
  
  // Listen for fullscreen change events (e.g. user presses Esc)
  useEffect(() => {
    const handleFullscreenChange = () => {
        setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }
  }, []);

  // Process content to disable links
  const processedContent = React.useMemo(() => {
    // Inject script to intercept clicks
    const script = `
      <script>
        document.addEventListener('click', function(e) {
          if (e.target.closest('a')) {
            e.preventDefault();
            console.log('Link navigation prevented');
          }
        }, true);
      </script>
    `;
    return content + script;
  }, [content]);

  return (
    <div ref={containerRef} className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>HTML 预览</span>
        <Space>
          <Tooltip title="复制源码">
            <Button type="text" icon={<CopyOutlined />} onClick={handleCopy} />
          </Tooltip>
          <Tooltip title="下载文件">
            <Button type="text" icon={<DownloadOutlined />} onClick={handleDownload} />
          </Tooltip>
          <Tooltip title={isFullscreen ? "退出全屏" : "全屏预览"}>
            <Button type="text" icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />} onClick={toggleFullscreen} />
          </Tooltip>
          <Tooltip title="关闭">
            <Button type="text" icon={<CloseOutlined />} onClick={onClose} />
          </Tooltip>
        </Space>
      </div>
      <div className={styles.content}>
        <iframe
          key={iframeKey}
          ref={iframeRef}
          className={styles.iframe}
          sandbox="allow-scripts allow-forms allow-popups allow-modals allow-same-origin"
          title="preview"
          srcDoc={processedContent}
        />
      </div>
    </div>
  );
};

export default PreviewPanel;

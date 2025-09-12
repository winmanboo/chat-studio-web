'use client';

import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';

interface VersionData {
  currentVersion: string;
  newVersion: string;
  environment: string;
  updateNotes: {
    title?: string;
    description?: string;
    features?: string[];
    isPrerelease?: boolean;
    versionType?: string;
    releaseDate?: string;
    buildTime?: string;
  };
  isPrerelease: boolean;
}

interface UseServiceWorkerReturn {
  isSupported: boolean;
  isRegistered: boolean;
  hasUpdate: boolean;
  versionData: VersionData | null;
  registerServiceWorker: () => Promise<void>;
  checkForUpdates: () => void;
  dismissUpdate: () => void;
}

export const useServiceWorker = (): UseServiceWorkerReturn => {
  const [isSupported, setIsSupported] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [hasUpdate, setHasUpdate] = useState(false);
  const [versionData, setVersionData] = useState<VersionData | null>(null);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // 检查浏览器是否支持Service Worker
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      setIsSupported(true);
    }
  }, []);

  // 注册Service Worker
  const registerServiceWorker = useCallback(async () => {
    if (!isSupported) {
      console.warn('Service Worker not supported in this browser');
      return;
    }

    try {
      const reg = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      setRegistration(reg);
      setIsRegistered(true);

      // 监听Service Worker状态变化
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // 这里可以提示用户有新版本
            }
          });
        }
      });

      // 监听来自Service Worker的消息
      navigator.serviceWorker.addEventListener('message', (event) => {
        const { type, data } = event.data;
        
        switch (type) {
          case 'VERSION_UPDATE_AVAILABLE':
            setVersionData(data);
            setHasUpdate(true);
            
            // 根据环境和版本类型显示不同的通知
            const isPrerelease = data.isPrerelease;
            const envText = data.environment === 'development' ? '[开发]' : 
                           data.environment === 'staging' ? '[测试]' : '';
            const versionText = isPrerelease ? 
              `${envText} ${data.updateNotes.versionType?.toUpperCase()} 版本` : 
              `版本 ${data.newVersion}`;
            
            message.info({
              content: `检测到新${versionText}，点击查看更新内容`,
              duration: 5,
              key: 'version-update'
            });
            break;
          
          default:
            break;
        }
      });

      // 如果已经有激活的Service Worker，立即检查版本
      if (reg.active) {
        checkForUpdates();
      }

    } catch (error) {
      console.error('Service Worker registration failed:', error);
      message.error('Service Worker 注册失败');
    }
  }, [isSupported]);

  // 手动检查更新
  const checkForUpdates = useCallback(() => {
    if (!registration || !registration.active) {
      return;
    }

    registration.active.postMessage({ type: 'CHECK_VERSION' });
  }, [registration]);

  // 关闭更新提示
  const dismissUpdate = useCallback(() => {
    setHasUpdate(false);
    setVersionData(null);
    message.destroy('version-update');
  }, []);

  // 页面加载时自动注册Service Worker
  useEffect(() => {
    if (isSupported && !isRegistered) {
      registerServiceWorker();
    }
  }, [isSupported, isRegistered, registerServiceWorker]);

  // 页面可见性变化时检查更新
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isRegistered) {
        // 页面重新可见时检查更新
        setTimeout(() => {
          checkForUpdates();
        }, 1000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isRegistered, checkForUpdates]);

  return {
    isSupported,
    isRegistered,
    hasUpdate,
    versionData,
    registerServiceWorker,
    checkForUpdates,
    dismissUpdate
  };
};

export default useServiceWorker;
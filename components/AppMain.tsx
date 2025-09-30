"use client";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import HeaderComponent from "./Header";
import UserModal from "./UserModal";
import SettingsModal from "./SettingsModal";
import VersionUpdateModal from "./VersionUpdateModal";
import { logout, UserInfo } from "../lib/api";
import { useServiceWorker } from "../lib/hooks/useServiceWorker";

interface AppMainProps {
  children: React.ReactNode;
}

const AppMain: React.FC<AppMainProps> = ({ children }) => {
  const pathname = usePathname();
  const [isLogin, setIsLogin] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  // 版本更新相关状态
  const {
    hasUpdate,
    versionData,
    dismissUpdate,
  } = useServiceWorker();

  // 根据当前路径确定选中的tab
  const getSelectedTab = () => {
    if (pathname.startsWith('/chat')) return 'chat';
    if (pathname.startsWith('/knowledgebase') || pathname.startsWith('/documents')) return 'kb';
    return 'chat'; // 默认选中chat
  };

  // 检查localStorage中的登录状态
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      const userInfoStr = localStorage.getItem('userInfo');
      
      // 如果存在token和用户信息，则认为用户已登录
      if (token && userInfoStr) {
        try {
          const parsedUserInfo = JSON.parse(userInfoStr); // 验证用户信息是否为有效的JSON
          setUserInfo(parsedUserInfo);
          setIsLogin(true);
        } catch {
          // 如果用户信息无效，则清除localStorage中的数据
          localStorage.removeItem('authToken');
          localStorage.removeItem('userInfo');
          setUserInfo(null);
          setIsLogin(false);
        }
      } else {
        // 如果缺少token或用户信息，则确保两者都被清除
        if (!token) localStorage.removeItem('authToken');
        if (!userInfoStr) localStorage.removeItem('userInfo');
        setUserInfo(null);
        setIsLogin(false);
      }
    }
  }, []);

  const handleUserClick = () => setUserModalOpen(true);
  const handleSettingsClick = () => setSettingsModalOpen(true);
  const handleUserModalClose = () => setUserModalOpen(false);
  const handleSettingsModalClose = () => setSettingsModalOpen(false);
  const handleLogin = () => {
    setIsLogin(true);
    // 重新获取用户信息
    if (typeof window !== 'undefined') {
      const userInfoStr = localStorage.getItem('userInfo');
      if (userInfoStr) {
        try {
          const parsedUserInfo = JSON.parse(userInfoStr);
          setUserInfo(parsedUserInfo);
        } catch {
          setUserInfo(null);
        }
      }
    }
  };
  
  // 版本更新相关处理函数
  const handleVersionUpdateClose = () => {
    dismissUpdate();
  };
  
  const handleRefresh = () => {
    window.location.reload();
  };
  
  const handleOpenNewTab = () => {
    window.open(window.location.href, '_blank');
  };

  const handleLogout = async () => {
    try {
      // 调用登出接口
      await logout();
    } catch (error) {
      console.error('登出接口调用失败:', error);
    } finally {
      // 无论接口调用成功与否，都要清除本地认证信息
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userInfo');
      }
      setUserInfo(null);
      setIsLogin(false);
      // 登出后重定向到主页面，清理所有界面数据
      window.location.href = '/';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
      <HeaderComponent 
        selectedTab={getSelectedTab()} 
        onUserClick={handleUserClick}
        onSettingsClick={handleSettingsClick}
        isLogin={isLogin}
        onLogout={handleLogout}
        userInfo={userInfo}
      />
      <main style={{ flex: 1, width: '100%', alignSelf: 'stretch', display: 'flex', minHeight: 0, overflow: 'hidden' }}>
        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          {children}
        </div>
      </main>
      <UserModal
        open={userModalOpen}
        onCancel={handleUserModalClose}
        onLogin={handleLogin}
      />
      <SettingsModal
        open={settingsModalOpen}
        onClose={handleSettingsModalClose}
        userInfo={userInfo}
      />
      <VersionUpdateModal
        visible={hasUpdate}
        versionData={versionData}
        onClose={handleVersionUpdateClose}
        onRefresh={handleRefresh}
        onOpenNewTab={handleOpenNewTab}
      />
    </div>
  );
};

export default AppMain;
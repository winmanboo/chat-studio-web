"use client";
import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import HeaderComponent from "./Header";
import UserModal from "./UserModal";
import SettingsModal from "./SettingsModal";
import { logout } from "../lib/api";

interface AppMainProps {
  children: React.ReactNode;
}

const AppMain: React.FC<AppMainProps> = ({ children }) => {
  const pathname = usePathname();
  const [userModalOpen, setUserModalOpen] = React.useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = React.useState(false);
  const [isLogin, setIsLogin] = React.useState(false);

  // 根据当前路径确定选中的tab
  const getSelectedTab = () => {
    if (pathname.startsWith('/chat')) return 'chat';
    if (pathname.startsWith('/knowledgebase')) return 'kb';
    if (pathname.startsWith('/market')) return 'market';
    return 'chat'; // 默认选中chat
  };

  // 检查localStorage中的登录状态
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      const userInfo = localStorage.getItem('userInfo');
      
      // 如果存在token和用户信息，则认为用户已登录
      if (token && userInfo) {
        try {
          JSON.parse(userInfo); // 验证用户信息是否为有效的JSON
          setIsLogin(true);
        } catch {
          // 如果用户信息无效，则清除localStorage中的数据
          localStorage.removeItem('authToken');
          localStorage.removeItem('userInfo');
          setIsLogin(false);
        }
      } else {
        // 如果缺少token或用户信息，则确保两者都被清除
        if (!token) localStorage.removeItem('authToken');
        if (!userInfo) localStorage.removeItem('userInfo');
        setIsLogin(false);
      }
    }
  }, []);


  const handleUserClick = () => setUserModalOpen(true);
  const handleSettingsClick = () => setSettingsModalOpen(true);
  const handleUserModalClose = () => setUserModalOpen(false);
  const handleSettingsModalClose = () => setSettingsModalOpen(false);
  const handleLogin = () => setIsLogin(true);
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
      setIsLogin(false);
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
      />
      <main style={{ flex: 1, width: '100%', alignSelf: 'stretch', display: 'flex' }}>
        <div style={{ flex: 1, display: 'flex' }}>
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
        onCancel={handleSettingsModalClose}
      />
    </div>
  );
};

export default AppMain;
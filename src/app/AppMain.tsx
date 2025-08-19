"use client";
import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import HeaderComponent from "../../components/Header";
import UserModal from "../../components/UserModal";
import SettingsModal from "../../components/SettingsModal";
import { logout } from "../api";

const ChatPage = dynamic(() => import("./chat/page"), { ssr: false });
const KnowledgeBasePage = dynamic(() => import("./knowledgebase/page"), { ssr: false });
const MarketPage = dynamic(() => import("./market/page"), { ssr: false });

const AppMain: React.FC = () => {
  const [selectedTab, setSelectedTab] = React.useState("chat");
  const [userModalOpen, setUserModalOpen] = React.useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = React.useState(false);
  const [isLogin, setIsLogin] = React.useState(false);

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

  const handleTabChange = (tab: string) => setSelectedTab(tab);
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

  let MainContent = null;
  if (selectedTab === "chat") MainContent = <ChatPage />;
  else if (selectedTab === "kb") MainContent = <KnowledgeBasePage />;
  else if (selectedTab === "market") MainContent = <MarketPage />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
      <HeaderComponent 
        selectedTab={selectedTab} 
        onTabChange={handleTabChange} 
        onUserClick={handleUserClick}
        onSettingsClick={handleSettingsClick}
        isLogin={isLogin}
        onLogout={handleLogout}
      />
      <main style={{ flex: 1, width: '100%', alignSelf: 'stretch', display: 'flex' }}>
        <div style={{ flex: 1, display: 'flex' }}>
          {MainContent}
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
"use client";
import React from "react";
import dynamic from "next/dynamic";
import HeaderComponent from "../../components/Header";
import UserModal from "../../components/UserModal";

const ChatPage = dynamic(() => import("./chat/page"), { ssr: false });
const KnowledgeBasePage = dynamic(() => import("./knowledgebase/page"), { ssr: false });
const MarketPage = dynamic(() => import("./market/page"), { ssr: false });

const AppMain: React.FC = () => {
  const [selectedTab, setSelectedTab] = React.useState("chat");
  const [userModalOpen, setUserModalOpen] = React.useState(false);
  const [isLogin, setIsLogin] = React.useState(false);

  const handleTabChange = (tab: string) => setSelectedTab(tab);
  const handleUserClick = () => setUserModalOpen(true);
  const handleModalClose = () => setUserModalOpen(false);
  const handleLogin = () => setIsLogin(true);
  const handleLogout = () => setIsLogin(false);

  let MainContent = null;
  if (selectedTab === "chat") MainContent = <ChatPage />;
  else if (selectedTab === "kb") MainContent = <KnowledgeBasePage />;
  else if (selectedTab === "market") MainContent = <MarketPage />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
      <HeaderComponent selectedTab={selectedTab} onTabChange={handleTabChange} onUserClick={handleUserClick} />
      <main style={{ flex: 1, width: '100%', alignSelf: 'stretch', display: 'flex' }}>
        <div style={{ flex: 1, display: 'flex' }}>
          {MainContent}
        </div>
      </main>
      <UserModal
        open={userModalOpen}
        onCancel={handleModalClose}
        isLogin={isLogin}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />
    </div>
  );
};

export default AppMain;
'use client';

import React, { useState, useEffect } from 'react';
import { Layout, Typography, Card, Button, Space, message, Spin } from 'antd';
import { PlusOutlined, DatabaseOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { UserInfo } from '@/lib/api';
import MCPServerList from '@/components/mcp/MCPServerList';
import AddMCPServerModal from '@/components/mcp/AddMcpServerModal';

const { Content } = Layout;
const { Title, Text } = Typography;

export default function MCPPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState<boolean | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userInfoStr = localStorage.getItem('userInfo');
    
    if (token && userInfoStr) {
      setIsLogin(true);
      setUserInfo(JSON.parse(userInfoStr));
    } else {
      setIsLogin(false);
      message.warning('请先登录后使用 MCP 功能');
      router.push('/chat');
    }
  }, [router]);

  const handleAddServer = () => {
    setAddModalVisible(true);
  };

  const handleAddSuccess = () => {
    setAddModalVisible(false);
    setRefreshTrigger(prev => prev + 1);
    message.success('MCP 服务器添加成功');
  };

  const handleAddCancel = () => {
    setAddModalVisible(false);
  };

  if (isLogin === null) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!isLogin) {
    return null;
  }

  return (
    <div className="h-full w-full bg-gradient-to-br from-gray-50 to-blue-50 relative flex flex-col">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col p-6 min-h-0">
        {/* MCP 服务器列表 */}
        <div className="flex-1 flex flex-col min-h-0">
          <MCPServerList 
            onAddServer={() => setAddModalVisible(true)}
            refreshTrigger={refreshTrigger}
          />
        </div>

        {/* 添加服务器模态框 */}
        <AddMCPServerModal
          visible={addModalVisible}
          onCancel={() => setAddModalVisible(false)}
          onSuccess={handleAddSuccess}
        />
      </div>

      {/* 全局动画样式 */}
      <style jsx global>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }

        /* 自定义滚动条 */
        ::-webkit-scrollbar {
          width: 6px;
        }

        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
        }
      `}</style>
    </div>
  );
}
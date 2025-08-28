'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  
  useEffect(() => {
    // 自动重定向到聊天页面
    router.replace('/chat');
  }, [router]);
  
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      width: '100%',
      height: '100%',
      minHeight: 'calc(100vh - 64px)',
      background: 'linear-gradient(135deg, #f5f6fa 0%, #e8eaf6 100%)'
    }}>
      {/* Logo和旋转动画 */}
      <div style={{
        position: 'relative',
        marginBottom: '32px'
      }}>
        {/* 外圈旋转动画 */}
        <div style={{
          width: '80px',
          height: '80px',
          border: '3px solid #e0e0e0',
          borderTop: '3px solid #667eea',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          position: 'absolute',
          top: '-10px',
          left: '-10px'
        }} />
        
        {/* 中心Logo */}
        <div style={{
          width: '60px',
          height: '60px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '24px',
          fontWeight: 'bold',
          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
        }}>
          AI
        </div>
      </div>
      
      {/* 应用名称 */}
      <h1 style={{
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#333',
        marginBottom: '16px',
        letterSpacing: '0.5px'
      }}>
        Chat Studio
      </h1>
      
      {/* 加载提示 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        color: '#666',
        fontSize: '16px'
      }}>
        <div style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: '#667eea',
          animation: 'pulse 1.5s ease-in-out infinite'
        }} />
        <div style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: '#667eea',
          animation: 'pulse 1.5s ease-in-out 0.2s infinite'
        }} />
        <div style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: '#667eea',
          animation: 'pulse 1.5s ease-in-out 0.4s infinite'
        }} />
        <span style={{ marginLeft: '12px' }}>正在启动应用...</span>
      </div>
      
      {/* CSS动画 */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 80%, 100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% {
            transform: scale(1.2);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
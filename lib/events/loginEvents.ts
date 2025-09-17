// 登录事件管理器
type LoginEventCallback = () => void;

class LoginEventManager {
  private callbacks: LoginEventCallback[] = [];

  // 添加登录成功回调
  onLoginSuccess(callback: LoginEventCallback) {
    this.callbacks.push(callback);
    
    // 返回取消订阅的函数
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }

  // 触发登录成功事件
  triggerLoginSuccess() {
    this.callbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('登录回调执行失败:', error);
      }
    });
  }

  // 清除所有回调
  clearCallbacks() {
    this.callbacks = [];
  }
}

// 导出单例实例
export const loginEventManager = new LoginEventManager();
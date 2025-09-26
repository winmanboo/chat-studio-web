// 模型事件管理器
type ModelEventCallback = () => void;

class ModelEventManager {
  private callbacks: ModelEventCallback[] = [];

  // 添加模型变更回调
  onModelChange(callback: ModelEventCallback) {
    this.callbacks.push(callback);
    
    // 返回取消订阅的函数
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }

  // 触发模型变更事件（安装、删除、设置默认等操作后调用）
  triggerModelChange() {
    this.callbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('模型变更回调执行失败:', error);
      }
    });
  }

  // 清除所有回调
  clearCallbacks() {
    this.callbacks = [];
  }
}

// 导出单例实例
export const modelEventManager = new ModelEventManager();
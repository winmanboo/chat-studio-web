/**
 * 剪贴板工具函数
 * 提供统一的复制功能，支持现代 Clipboard API 和降级方案
 */

export interface CopyOptions {
  /** 复制成功的回调函数 */
  onSuccess?: () => void;
  /** 复制失败的回调函数 */
  onError?: (error: Error) => void;
}

/**
 * 检查 Clipboard API 是否可用
 */
export const isClipboardAPIAvailable = (): boolean => {
  return !!(
    typeof navigator !== 'undefined' &&
    navigator.clipboard &&
    typeof navigator.clipboard.writeText === 'function'
  );
};

/**
 * 使用降级方法复制文本（document.execCommand）
 */
const fallbackCopyText = (text: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      
      // 设置样式避免页面闪烁
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      textArea.style.opacity = '0';
      textArea.style.pointerEvents = 'none';
      
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        resolve();
      } else {
        reject(new Error('document.execCommand("copy") 执行失败'));
      }
    } catch (error) {
      reject(error instanceof Error ? error : new Error('降级复制方法执行失败'));
    }
  });
};

/**
 * 复制文本到剪贴板
 * @param text 要复制的文本
 * @param options 复制选项
 */
export const copyToClipboard = async (text: string, options: CopyOptions = {}): Promise<void> => {
  const { onSuccess, onError } = options;
  
  if (!text) {
    const error = new Error('复制内容不能为空');
    onError?.(error);
    throw error;
  }

  try {
    // 优先使用现代 Clipboard API
    if (isClipboardAPIAvailable()) {
      await navigator.clipboard.writeText(text);
    } else {
      // 降级到 document.execCommand
      await fallbackCopyText(text);
    }
    
    // 复制成功
    onSuccess?.();
  } catch (error) {
    // 如果现代 API 失败，尝试降级方法
    if (isClipboardAPIAvailable()) {
      try {
        await fallbackCopyText(text);
        onSuccess?.();
        return;
      } catch (fallbackError) {
        // 两种方法都失败了
        const finalError = fallbackError instanceof Error ? fallbackError : new Error('复制失败');
        onError?.(finalError);
        throw finalError;
      }
    } else {
      const finalError = error instanceof Error ? error : new Error('复制失败');
      onError?.(finalError);
      throw finalError;
    }
  }
};

/**
 * 为按钮元素添加复制成功的视觉反馈
 * @param button 按钮元素
 * @param duration 反馈持续时间（毫秒）
 */
export const showCopyButtonFeedback = (button: HTMLButtonElement, duration: number = 2000): void => {
  const originalText = button.textContent;
  const originalClassName = button.className;
  
  // 添加复制成功样式
  button.classList.add('copied');
  button.textContent = '已复制';
  
  // 恢复原始状态
  setTimeout(() => {
    button.className = originalClassName;
    button.textContent = originalText;
  }, duration);
};

/**
 * 从代码块容器中提取文本内容
 * @param container 代码块容器元素
 */
export const extractCodeBlockText = (container: Element): string => {
  if (container.classList.contains('mermaid-container')) {
    // 对于 Mermaid 图表，复制原始代码
    const mermaidElement = container.querySelector('.mermaid');
    return mermaidElement?.textContent || '';
  } else {
    // 对于普通代码块，复制代码内容
    const codeContent = container.querySelector('.code-content');
    if (codeContent) {
      const codeLines = codeContent.querySelectorAll('.code-line');
      return Array.from(codeLines).map(line => line.textContent || '').join('\n');
    }
  }
  return '';
};
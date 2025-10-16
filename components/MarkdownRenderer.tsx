"use client";
import React from 'react';
import { Typography } from 'antd';
import MarkdownIt from 'markdown-it';
import mermaid from 'mermaid';
import hljs from 'highlight.js';

// 禁用Haskell语言以修复正则表达式错误
if (typeof window !== 'undefined' && hljs.getLanguage('haskell')) {
  hljs.unregisterLanguage('haskell');
}

interface CustomWindow extends Window {
  copyCodeToClipboard: (button: HTMLButtonElement) => void;
  handleMermaidZoom: (element: HTMLElement) => void;
}

// 初始化 markdown-it
const md = new MarkdownIt({
  html: true,        // 启用HTML标签
  linkify: true,     // 自动转换URL为链接
  typographer: false, // 禁用typographer以避免isSpace错误
  breaks: true,      // 转换\n为<br>
  highlight: function (str: string, lang: string): string {
    const languageLabel = lang || 'text';
    const displayLang = languageLabel === 'text' ? 'plain' : languageLabel;
    
    // 处理Mermaid图表
     if (lang === 'mermaid') {
       const mermaidId = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9).replace(/[^a-zA-Z0-9]/g, '')}`;
       return `<div class="mermaid-container"><div class="code-header"><span class="language-label">mermaid</span><button class="copy-button" onclick="copyCodeToClipboard(this)">复制</button></div><div class="mermaid" id="${mermaidId}" onclick="handleMermaidZoom(this)">${str}</div></div>`;
     }

    // 处理其他代码块
    // 注意：不要使用trim()，因为它会去除重要的换行符
    let highlightedCode = '';
    
    // 使用highlight.js进行语法高亮
    if (lang && lang !== 'text' && hljs.getLanguage(lang)) {
      try {
        const result = hljs.highlight(str, { language: lang });
        highlightedCode = result.value;
      } catch (err) {
        console.warn('Highlight.js error:', err);
        highlightedCode = hljs.highlightAuto(str).value;
      }
    } else {
      // 如果没有指定语言或语言不支持，使用自动检测
      highlightedCode = hljs.highlightAuto(str).value;
    }
    
    // 分割高亮后的代码为行
    const codeLines = highlightedCode.split('\n');
    
    // 确保最后一行不是空的，如果是则移除（但保留有意义的空行）
    if (codeLines.length > 0 && codeLines[codeLines.length - 1] === '') {
      codeLines.pop();
    }
    const lineNumbers = codeLines.map((_, index) => `<span class="line-number">${index + 1}</span>`).join('');
    const codeContent = codeLines.map(line => `<span class="code-line">${line === '' ? ' ' : line}</span>`).join('');
    
    return `<div class="code-block-container"><div class="code-header"><span class="language-label">${displayLang}</span><button class="copy-button" onclick="copyCodeToClipboard(this)">复制</button></div><pre><code><div class="line-numbers">${lineNumbers}</div><div class="code-content">${codeContent}</div></code></pre></div>`;
  }
});

// 添加复制功能到全局
if (typeof window !== 'undefined') {
  (window as typeof window & { copyCodeToClipboard: (button: HTMLButtonElement) => void }).copyCodeToClipboard = async function(button: HTMLButtonElement) {
    const { copyToClipboard, showCopyButtonFeedback, extractCodeBlockText } = await import('@/lib/utils/clipboardUtils');
    
    const codeContainer = button.closest('.code-block-container, .mermaid-container');
    if (!codeContainer) return;
    
    const textToCopy = extractCodeBlockText(codeContainer);
    if (!textToCopy) return;
    
    try {
      await copyToClipboard(textToCopy, {
        onSuccess: () => showCopyButtonFeedback(button),
        onError: (error) => {
          console.error('复制失败:', error);
          button.textContent = '复制失败';
          setTimeout(() => {
            button.textContent = '复制';
          }, 2000);
        }
      });
    } catch (error) {
      // 错误已在 onError 回调中处理
    }
  };
}

// Mermaid渲染组件
const MermaidRenderer: React.FC<{ content: string }> = React.memo(({ content }) => {
  const [htmlContent, setHtmlContent] = React.useState('');
  const containerRef = React.useRef<HTMLDivElement>(null);
  const mermaidInitialized = React.useRef(false);
  const lastContentRef = React.useRef<string>('');
  const renderedHtmlRef = React.useRef<string>('');
  const processingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const processedTablesRef = React.useRef<Set<Element>>(new Set());
  
  // 初始化Mermaid并添加全局缩放处理
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as unknown as CustomWindow).handleMermaidZoom = (element: HTMLElement) => {
        const svg = element.querySelector('svg');
        if (!svg) return;
        
        const modal = document.createElement('div');
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100vw';
        modal.style.height = '100vh';
        modal.style.backgroundColor = 'rgba(0,0,0,0.8)';
        modal.style.display = 'flex';
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'center';
        modal.style.zIndex = '9999';
        modal.onclick = () => document.body.removeChild(modal);
        
        const clonedSvg = svg.cloneNode(true) as SVGElement;
        clonedSvg.style.maxWidth = '90vw';
clonedSvg.style.maxHeight = '90vh';
clonedSvg.style.background = '#fff';
clonedSvg.style.padding = '20px';
clonedSvg.style.borderRadius = '8px';
clonedSvg.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
clonedSvg.style.cursor = 'zoom-out';
        modal.appendChild(clonedSvg);
        document.body.appendChild(modal);
      };
    }
  }, []);

  // 初始化Mermaid（只执行一次）
  React.useEffect(() => {
    if (typeof window !== 'undefined' && !mermaidInitialized.current) {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
        fontFamily: 'inherit'
      });
      mermaidInitialized.current = true;
    }
  }, []);
  
  React.useEffect(() => {
    // 只有当内容真正改变时才重新渲染
    if (content !== lastContentRef.current) {
      lastContentRef.current = content;
      
      // 直接渲染Markdown，避免额外的预处理
      const rendered = md.render(content);
      
      // 只有当渲染结果真正改变时才更新状态
      if (rendered !== renderedHtmlRef.current) {
        renderedHtmlRef.current = rendered;
        setHtmlContent(rendered);
        // 重置已处理的表格集合，因为HTML内容已更新
        processedTablesRef.current.clear();
      }
    }
  }, [content]);
  
  // 渲染Mermaid图表和处理表格滚动（带防抖）
  React.useEffect(() => {
    if (typeof window !== 'undefined' && htmlContent && containerRef.current) {
      // 清除之前的定时器
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
      
      // 使用防抖机制，减少频繁的DOM操作
      processingTimeoutRef.current = setTimeout(() => {
        const container = containerRef.current;
        if (!container) return;
        
        // 查找容器内未处理的Mermaid图表
        const mermaidElements = container.querySelectorAll('.mermaid:not([data-processed])');
        
        mermaidElements.forEach(async (element) => {
          try {
            const graphDefinition = element.textContent || '';
            if (graphDefinition.trim()) {
              const uniqueId = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9).replace(/[^a-zA-Z0-9]/g, '')}`;
              const { svg } = await mermaid.render(uniqueId, graphDefinition);
              element.innerHTML = svg;
              element.setAttribute('data-processed', 'true');
            }
          } catch (error) {
            console.warn('Mermaid渲染失败:', error);
            element.innerHTML = `<pre style="color: red;">Mermaid图表渲染失败: ${error}</pre>`;
            element.setAttribute('data-processed', 'true');
          }
        });
        
        // 处理表格样式（不添加滚动容器）
        const tables = container.querySelectorAll('table:not([data-processed])');
        tables.forEach((table) => {
          // 检查是否已经处理过这个表格
          if (processedTablesRef.current.has(table)) {
            return;
          }
          
          // 标记表格为已处理
          table.setAttribute('data-processed', 'true');
          processedTablesRef.current.add(table);
          
          // 检查表格是否需要换行处理
          const cells = table.querySelectorAll('td, th');
          let needsWrapping = false;
          
          cells.forEach(cell => {
            const cellText = cell.textContent || '';
            if (cellText.length > 30) { // 如果单元格文本超过30个字符
              needsWrapping = true;
            }
          });
          
          if (needsWrapping) {
            table.classList.add('wrap-content');
          }
        });
      }, 100); // 100ms防抖延迟
    }
  }, [htmlContent]);
  
  // 清理定时器
  React.useEffect(() => {
    return () => {
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
    };
  }, []);
  
  return (
    <div 
      ref={containerRef}
      className="markdown-content"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
      style={{
        position: 'relative',
        padding: '0',
        margin: '0'
      }}
    />
  );
});

MermaidRenderer.displayName = 'MermaidRenderer';

// Markdown渲染函数
export const renderMarkdown = (content: string): React.ReactNode => {
  // 如果内容不是字符串，直接返回
  if (typeof content !== 'string') {
    return content as React.ReactNode;
  }
  
  // 如果内容为空，返回空字符串
  if (!content) {
    return '';
  }
  
  try {
    return <MermaidRenderer content={content} />;
  } catch (error) {
    // 如果渲染出错，记录错误但不在控制台显示用户内容（避免泄露敏感信息）
    console.warn('Markdown渲染出错:', error);
    
    // 降级处理：使用纯文本显示，保持基本的换行格式
    const fallbackContent = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/\n/g, '<br/>');
    
    return (
      <Typography>
        <div 
          dangerouslySetInnerHTML={{ __html: fallbackContent }}
          style={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}
        />
      </Typography>
    );
  }
};

export default MermaidRenderer;
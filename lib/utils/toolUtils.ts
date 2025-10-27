/**
 * 工具调用内容处理工具函数
 */

export interface ToolContent {
  toolText: string;
  remainingContent: string;
}

/**
 * 从内容中提取工具调用内容
 * @param content 原始内容
 * @returns 提取的工具调用内容和剩余内容
 */
export function extractToolContent(content: string): ToolContent {
  const toolRegex = /<tool>([\s\S]*?)<\/tool>/g;
  let toolText = '';
  let remainingContent = content;
  
  // 提取所有 <tool></tool> 标签内的内容
  let match;
  const toolParts: string[] = [];
  
  while ((match = toolRegex.exec(content)) !== null) {
    // 保持原始格式，不进行trim处理
    toolParts.push(match[1]);
  }
  
  if (toolParts.length > 0) {
    // 直接连接，不添加额外的换行
    toolText = toolParts.join('');
    // 移除原内容中的 <tool></tool> 标签及其内容
    remainingContent = content.replace(toolRegex, '').trim();
  }
  
  return {
    toolText,
    remainingContent
  };
}

/**
 * 检查内容是否包含工具调用标签
 * @param content 内容
 * @returns 是否包含工具调用内容
 */
export function hasToolContent(content: string): boolean {
  return /<tool>[\s\S]*?<\/tool>/.test(content);
}

/**
 * 解析工具调用内容，提取工具名称列表
 * @param toolText 工具调用文本内容
 * @returns 工具名称列表
 */
export function parseToolNames(toolText: string): string[] {
  if (!toolText) return [];
  
  // 按行分割，过滤空行，去除前后空格
  const lines = toolText.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
  
  return lines;
}
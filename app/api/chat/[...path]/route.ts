import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:8080';

// 请求头白名单 - 只转发必要的请求头
const ALLOWED_HEADERS = [
  'content-type',
  'authorization', 
  'auth-token',
  'user-agent',
  'accept',
  'accept-language',
  'accept-encoding',
  'cache-control'
] as const;

// 流式响应的内容类型
const STREAMING_CONTENT_TYPES = [
  'text/plain',
  'text/event-stream',
  'application/x-ndjson'
] as const;

/**
 * 检查是否为流式响应
 */
function isStreamingResponse(contentType: string): boolean {
  return STREAMING_CONTENT_TYPES.some(type => contentType.includes(type));
}

/**
 * 构建转发请求头
 */
function buildForwardHeaders(request: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {};
  
  ALLOWED_HEADERS.forEach(headerName => {
    const value = request.headers.get(headerName);
    if (value) {
      headers[headerName] = value;
    }
  });
  
  return headers;
}

/**
 * 构建 CORS 响应头
 */
function buildCorsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Auth-Token',
  };
}

/**
 * 构建流式响应头
 */
function buildStreamingHeaders(contentType: string): Record<string, string> {
  return {
    'Content-Type': contentType,
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no', // 禁用 Nginx 缓冲
    ...buildCorsHeaders(),
  };
}

/**
 * 处理所有 HTTP 请求的核心逻辑
 */
async function handleRequest(
  request: NextRequest,
  { params }: { params: { path: string[] } }
): Promise<Response> {
  const method = request.method;
  const path = params.path.join('/');
  const backendUrl = `${BACKEND_URL}/chat/${path}`;
  
  try {
    // 构建转发请求
    const forwardHeaders = buildForwardHeaders(request);
    
    // 发起后端请求
    const response = await fetch(backendUrl, {
      method,
      headers: forwardHeaders,
      body: method === 'GET' || method === 'HEAD' ? undefined : request.body,
      // @ts-ignore - duplex 是 Node.js 18+ 的新特性，用于支持流式请求体
      duplex: 'half',
    });
    
    // 处理后端错误
    if (!response.ok) {
      console.error(`[Chat API] Backend error: ${response.status} ${response.statusText} for ${method} /api/chat/${path}`);
      return NextResponse.json(
        { 
          error: 'Backend service unavailable',
          code: 'BACKEND_ERROR',
          status: response.status 
        },
        { 
          status: response.status,
          headers: buildCorsHeaders()
        }
      );
    }
    
    const contentType = response.headers.get('content-type') || '';
    
    // 处理流式响应
    if (isStreamingResponse(contentType)) {
      return new Response(response.body, {
        status: response.status,
        headers: buildStreamingHeaders(contentType),
      });
    }
    
    // 处理普通响应
    const responseData = await response.text();
    return new NextResponse(responseData, {
      status: response.status,
      headers: {
        'Content-Type': contentType,
        ...buildCorsHeaders(),
      },
    });
    
  } catch (error) {
    console.error(`[Chat API] Request failed:`, {
      method,
      path: `/api/chat/${path}`,
      backendUrl,
      error: error instanceof Error ? error.message : String(error)
    });
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        code: 'PROXY_ERROR',
        message: 'Failed to proxy request to backend service'
      },
      { 
        status: 500,
        headers: buildCorsHeaders()
      }
    );
  }
}

// 导出所有 HTTP 方法处理函数
export async function GET(
  request: NextRequest,
  context: { params: { path: string[] } }
) {
  return handleRequest(request, context);
}

export async function POST(
  request: NextRequest,
  context: { params: { path: string[] } }
) {
  return handleRequest(request, context);
}

export async function PUT(
  request: NextRequest,
  context: { params: { path: string[] } }
) {
  return handleRequest(request, context);
}

export async function DELETE(
  request: NextRequest,
  context: { params: { path: string[] } }
) {
  return handleRequest(request, context);
}

export async function PATCH(
  request: NextRequest,
  context: { params: { path: string[] } }
) {
  return handleRequest(request, context);
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: buildCorsHeaders(),
  });
}
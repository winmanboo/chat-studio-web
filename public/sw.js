// Service Worker for version management and update notifications
const CACHE_NAME = 'chat-studio-development-v0.2.0';
const ENVIRONMENT = 'development';

// 统一的配置管理
// 注意：在 Service Worker 中无法直接 require Node.js 模块
// 所以这里保留配置但从统一的配置源获取
const VERSION_CHECK_INTERVALS = {
  development: 10000,  // 开发环境：10秒
  production: 60000    // 生产环境：60秒（与 version.config.js 保持一致）
};

const VERSION_CHECK_INTERVAL = VERSION_CHECK_INTERVALS[ENVIRONMENT] || 30000;

// 需要缓存的静态资源
const STATIC_CACHE_URLS = [
  '/',
  '/chat',
  '/documents',
  '/knowledgebase',
  '/market'
];

let currentVersion = null;
let versionCheckTimer = null;

// Service Worker 安装事件
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static resources');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Service Worker 激活事件
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
      .then(() => {
        // 从缓存名称获取当前版本（这是Service Worker构建时的版本）
        const versionMatch = CACHE_NAME.match(/v(.+)$/);
        if (versionMatch) {
          currentVersion = versionMatch[1];
        } else {
          currentVersion = '0.0.0'; // 默认版本
        }
        
        // 开始版本检查
        startVersionCheck();
      })
  );
});

// 拦截网络请求
self.addEventListener('fetch', (event) => {
  // 对于版本检查请求，总是从网络获取最新数据
  if (event.request.url.includes('/version.json')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // 克隆响应用于缓存
          const responseClone = response.clone();
          
          // 检查版本更新
          responseClone.json().then((versionData) => {
            checkForUpdates(versionData);
          }).catch((error) => {
            console.error('[SW] Error parsing version data:', error);
          });
          
          return response;
        })
        .catch(() => {
          // 网络失败时从缓存返回
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // 其他请求的缓存策略
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 缓存命中，返回缓存的资源
        if (response) {
          return response;
        }
        
        // 缓存未命中，从网络获取
        return fetch(event.request)
          .then((response) => {
            // 检查响应是否有效
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // 克隆响应用于缓存
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          });
      })
  );
});

// 监听来自客户端的消息
self.addEventListener('message', (event) => {
  const { type } = event.data;
  
  switch (type) {
    case 'CHECK_VERSION':
      if (ENVIRONMENT === 'development') {
        console.log('[SW] Manual version check disabled in development mode');
        return;
      }
      checkVersion();
      break;
    case 'MANUAL_UPDATE_CHECK':
      if (ENVIRONMENT === 'development') {
        console.log('[SW] Manual version check disabled in development mode');
        return;
      }
      checkVersion();
      break;
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    case 'GET_VERSION':
      event.ports[0]?.postMessage({
        type: 'VERSION_INFO',
        version: currentVersion
      });
      break;
    default:
      break;
  }
});

// 开始定期版本检查
function startVersionCheck() {
  // 在开发环境下禁用版本检查
  if (ENVIRONMENT === 'development') {
    console.log('[SW] Version check disabled in development mode');
    return;
  }
  
  // 立即检查一次
  checkVersion();
  
  // 设置定期检查
  versionCheckTimer = setInterval(() => {
    checkVersion();
  }, VERSION_CHECK_INTERVAL);
}

// 检查版本更新
function checkVersion() {
  // 在开发环境下禁用版本检查
  if (ENVIRONMENT === 'development') {
    console.log('[SW] Version check disabled in development mode');
    return;
  }
  
  fetch('/version.json', { 
    cache: 'no-cache',
    headers: {
      'Cache-Control': 'no-cache'
    }
  })
    .then((response) => {
      return response.json();
    })
    .then((versionData) => {
      checkForUpdates(versionData);
    })
    .catch((error) => {
      console.error('[SW] Version check failed:', error);
    });
}

// 检查是否有更新
function checkForUpdates(versionData) {
  const newVersion = versionData.version;
  
  if (!currentVersion) {
    // 首次加载，记录当前版本
    currentVersion = newVersion;
    return;
  }
  
  if (newVersion !== currentVersion) {
    const updateNotes = versionData.updateNotes[newVersion] || {};
    
    // 检查环境匹配
    const isEnvironmentMatch = !updateNotes.environment || updateNotes.environment === ENVIRONMENT;
    
    if (isEnvironmentMatch) {
      // 通知所有客户端有新版本
      notifyClientsOfUpdate(versionData);
    }
    
    // 更新当前版本
    currentVersion = newVersion;
  }
}

// 通知客户端有新版本
function notifyClientsOfUpdate(versionData) {
  const currentVersionNumber = CACHE_NAME.replace(/^.*-v/, '');
  const updateNotes = versionData.updateNotes[versionData.version] || {};
  
  self.clients.matchAll({ includeUncontrolled: true })
    .then((clients) => {
      const messageData = {
        type: 'VERSION_UPDATE_AVAILABLE',
        data: {
          currentVersion: currentVersionNumber,
          newVersion: versionData.version,
          environment: ENVIRONMENT,
          updateNotes,
          isPrerelease: updateNotes.isPrerelease || false
        }
      };
      
      clients.forEach((client) => {
        client.postMessage(messageData);
      });
    })
    .catch((error) => {
      console.error('[SW] Error notifying clients:', error);
    });
}

// 清理定时器
self.addEventListener('beforeunload', () => {
  if (versionCheckTimer) {
    clearInterval(versionCheckTimer);
  }
});
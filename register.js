// register.js
import { Workbox } from 'workbox-window';

if (typeof window !== 'undefined' && 'serviceWorker' in navigator && typeof caches !== 'undefined') {
  // 如果配置了起始 URL，确保其被缓存
  if (__PWA_START_URL__) {
    caches.has('start-url').then((has) => {
      if (!has) {
        caches.open('start-url').then((cache) => {
          cache.put(__PWA_START_URL__, new Response('', { status: 200 }));
        });
      }
    });
  }

  // 创建 Workbox 实例
  const wb = new Workbox(window.location.origin + __PWA_SW__, { scope: __PWA_SCOPE__ });

  // 监听 installed 事件
  wb.addEventListener('installed', (event) => {
    if (!event.isUpdate) {
      // 如果是首次安装，缓存起始 URL
      caches.open('start-url').then((cache) => {
        fetch(__PWA_START_URL__).then((response) => {
          if (response.redirected) {
            cache.put(__PWA_START_URL__, new Response(response.body, { status: 200, statusText: 'OK', headers: response.headers }));
          } else {
            cache.put(__PWA_START_URL__, response.clone());
          }
        });
      });

      // 缓存 Next.js 数据
      const data = window.performance.getEntriesByType('resource')
        .map((e) => e.name)
        .filter((n) => n.startsWith(`${window.location.origin}/_next/data/`) && n.endsWith('.json'));
      caches.open('next-data').then((cache) => {
        data.forEach((url) => cache.add(url));
      });
    }
  });

  // 监听 waiting 事件
  wb.addEventListener('waiting', () => {
    console.log('A new service worker is waiting to activate.');
  });

  // 监听 activated 事件
  wb.addEventListener('activated', (event) => {
    if (!event.isUpdate) {
      // 如果是首次激活，执行额外的缓存逻辑
      caches.open('start-url').then((cache) => {
        fetch(__PWA_START_URL__).then((response) => {
          if (!response.redirected) {
            cache.put(__PWA_START_URL__, response);
          }
        });
      });
    }
  });

  // 监听 message 事件
  wb.addEventListener('message', (event) => {
    if (event.data.type === 'CACHE_UPDATED') {
      const { updatedURL } = event.data.payload;
      console.log(`A newer version of ${updatedURL} is available!`);
    }
  });

  // 如果启用了服务工作线程注册，执行注册
  if (__PWA_ENABLE_REGISTER__) {
    wb.register();
  }

  // 如果启用了前端导航缓存或起始 URL 缓存，设置相关逻辑
  if (__PWA_CACHE_ON_FRONT_END_NAV__ || __PWA_START_URL__) {
    const cacheOnFrontEndNav = (url) => {
      if (!window.navigator.onLine) return;
      if (__PWA_CACHE_ON_FRONT_END_NAV__ && url !== __PWA_START_URL__) {
        caches.open('others').then((cache) => {
          cache.match(url, { ignoreSearch: true }).then((res) => {
            if (!res) cache.add(url);
          });
        });
      } else if (__PWA_START_URL__ && url === __PWA_START_URL__) {
        fetch(__PWA_START_URL__).then((response) => {
          if (!response.redirected) {
            caches.open('start-url').then((cache) => cache.put(__PWA_START_URL__, response));
          }
        });
      }
    };

    // 覆写 history.pushState 和 history.replaceState 方法
    const originalPushState = history.pushState;
    history.pushState = function () {
      originalPushState.apply(history, arguments);
      cacheOnFrontEndNav(arguments[2]);
    };

    const originalReplaceState = history.replaceState;
    history.replaceState = function () {
      originalReplaceState.apply(history, arguments);
      cacheOnFrontEndNav(arguments[2]);
    };

    // 监听 online 事件
    window.addEventListener('online', () => {
      cacheOnFrontEndNav(window.location.pathname);
    });
  }

  // 如果启用了在线时重新加载，设置相关逻辑
  if (__PWA_RELOAD_ON_ONLINE__) {
    window.addEventListener('online', () => {
      location.reload();
    });
  }
}
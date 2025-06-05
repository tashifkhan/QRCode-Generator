const CACHE_NAME = 'qr-generator-v1';
const PYODIDE_VERSION = '0.27.4';
const PYODIDE_BASE_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

// Static assets to cache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/script.js',
  '/styles.css',
  '/logo.png',
  '/manifest.json'
];

// Pyodide core files to cache
const PYODIDE_CORE_FILES = [
  `${PYODIDE_BASE_URL}pyodide.js`,
  `${PYODIDE_BASE_URL}pyodide.asm.js`,
  `${PYODIDE_BASE_URL}pyodide.asm.wasm`,
  `${PYODIDE_BASE_URL}pyodide.asm.data`,
  `${PYODIDE_BASE_URL}python_stdlib.zip`,
  `${PYODIDE_BASE_URL}packages.json`
];

// Python packages needed for QR generation
const PYTHON_PACKAGES = [
  'qrcode',
  'pillow',
  'micropip'
];

// Install event - cache static assets and Pyodide core
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        
        // Cache static assets first
        console.log('Service Worker: Caching static assets...');
        await cache.addAll(STATIC_ASSETS);
        
        // Cache Pyodide core files
        console.log('Service Worker: Caching Pyodide core files...');
        await cache.addAll(PYODIDE_CORE_FILES);
        
        // Pre-cache Python packages metadata
        await cachePackagesMetadata(cache);
        
        console.log('Service Worker: Installation complete');
        self.skipWaiting();
      } catch (error) {
        console.error('Service Worker: Installation failed:', error);
      }
    })()
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    (async () => {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
        
        // Take control of all pages immediately
        await self.clients.claim();
        console.log('Service Worker: Activation complete');
      } catch (error) {
        console.error('Service Worker: Activation failed:', error);
      }
    })()
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Handle different types of requests
  if (url.pathname.endsWith('.js') || url.pathname.endsWith('.css') || 
      url.pathname.endsWith('.html') || url.pathname.endsWith('.png') ||
      url.pathname === '/' || url.pathname.endsWith('.json')) {
    // Static assets - cache first strategy
    event.respondWith(cacheFirstStrategy(event.request));
  } else if (url.hostname === 'cdn.jsdelivr.net' && url.pathname.includes('pyodide')) {
    // Pyodide files - cache first strategy
    event.respondWith(cacheFirstStrategy(event.request));
  } else if (url.pathname.includes('packages') || url.pathname.includes('.whl')) {
    // Python packages - cache first strategy
    event.respondWith(cacheFirstStrategy(event.request));
  } else {
    // Other requests - network first strategy
    event.respondWith(networkFirstStrategy(event.request));
  }
});

// Cache first strategy - for static assets
async function cacheFirstStrategy(request) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('Service Worker: Serving from cache:', request.url);
      return cachedResponse;
    }
    
    console.log('Service Worker: Fetching from network:', request.url);
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Service Worker: Cache first strategy failed:', error);
    return new Response('Offline - Resource not available', { 
      status: 503, 
      statusText: 'Service Unavailable' 
    });
  }
}

// Network first strategy - for dynamic content
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Network failed, trying cache:', request.url);
    
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response('Offline - Resource not available', { 
      status: 503, 
      statusText: 'Service Unavailable' 
    });
  }
}

// Cache packages metadata for faster loading
async function cachePackagesMetadata(cache) {
  try {
    console.log('Service Worker: Caching packages metadata...');
    const packagesUrl = `${PYODIDE_BASE_URL}packages.json`;
    const packagesResponse = await fetch(packagesUrl);
    
    if (packagesResponse.ok) {
      const packagesData = await packagesResponse.json();
      
      // Cache wheel files for required packages
      for (const packageName of PYTHON_PACKAGES) {
        if (packagesData.packages[packageName]) {
          const packageInfo = packagesData.packages[packageName];
          const wheelUrl = `${PYODIDE_BASE_URL}${packageInfo.file_name}`;
          
          try {
            console.log(`Service Worker: Caching package: ${packageName}`);
            const wheelResponse = await fetch(wheelUrl);
            if (wheelResponse.ok) {
              await cache.put(wheelUrl, wheelResponse);
            }
          } catch (error) {
            console.warn(`Service Worker: Failed to cache package ${packageName}:`, error);
          }
        }
      }
    }
  } catch (error) {
    console.warn('Service Worker: Failed to cache packages metadata:', error);
  }
}

// Message handling for communication with main thread
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_PACKAGE') {
    const packageName = event.data.packageName;
    cacheAdditionalPackage(packageName);
  }
});

// Cache additional packages on demand
async function cacheAdditionalPackage(packageName) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const packagesUrl = `${PYODIDE_BASE_URL}packages.json`;
    const packagesResponse = await cache.match(packagesUrl) || await fetch(packagesUrl);
    
    if (packagesResponse.ok) {
      const packagesData = await packagesResponse.json();
      
      if (packagesData.packages[packageName]) {
        const packageInfo = packagesData.packages[packageName];
        const wheelUrl = `${PYODIDE_BASE_URL}${packageInfo.file_name}`;
        
        const wheelResponse = await fetch(wheelUrl);
        if (wheelResponse.ok) {
          await cache.put(wheelUrl, wheelResponse);
          console.log(`Service Worker: Cached additional package: ${packageName}`);
        }
      }
    }
  } catch (error) {
    console.error(`Service Worker: Failed to cache additional package ${packageName}:`, error);
  }
}

// Cleanup old pyodide versions
self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const keys = await cache.keys();
      
      // Remove old pyodide versions
      const oldPyodideFiles = keys.filter(request => 
        request.url.includes('pyodide') && 
        !request.url.includes(PYODIDE_VERSION)
      );
      
      await Promise.all(
        oldPyodideFiles.map(request => cache.delete(request))
      );
    })()
  );
});

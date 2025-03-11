# Zero Config PWA Plugin for Next.js

This plugin simplifies adding PWA capabilities to your Next.js application using Workbox and other optimized tools.

![size](https://img.shields.io/bundlephobia/minzip/next-pwa.svg)
![dependencies](https://img.shields.io/librariesio/release/npm/next-pwa)
![downloads](https://img.shields.io/npm/dw/next-pwa.svg)
![license](https://img.shields.io/npm/l/next-pwa.svg)

Share your PWA project [here](https://github.com/shadowwalker/next-pwa/discussions/206).

## Features

- Zero configuration for registering and generating service workers
- Optimized precaching and runtime caching
- Maximize Lighthouse score
- Comprehensive offline support with fallbacks
- Works with Workbox v6
- Supports custom workers for additional functionality
- Debug service workers in development mode without caching
- Configurable using Workbox options

## Installation

```bash
npm install next-pwa
```

## Basic Usage

### Step 1: Configure `next.config.js`

```javascript
const withPWA = require("next-pwa")({
  dest: "public",
});

module.exports = withPWA({
  // Next.js configuration
});
```

After running `next build`, the plugin will generate `sw.js` and other necessary files in your `public` directory.

### Step 2: Add Manifest File

Create a `manifest.json` in your `public` folder:

```json
{
  "name": "PWA App",
  "short_name": "App",
  "icons": [
    {
      "src": "/icons/android-chrome-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/android-chrome-384x384.png",
      "sizes": "384x384",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "theme_color": "#FFFFFF",
  "background_color": "#FFFFFF",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait"
}
```

### Step 3: Add Head Meta Tags

Add these tags in your `_document.js` or `_app.js`:

```html
<meta name="application-name" content="PWA App" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="apple-mobile-web-app-title" content="PWA App" />
<meta name="description" content="Best PWA App in the world" />
<meta name="format-detection" content="telephone=no" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="msapplication-config" content="/icons/browserconfig.xml" />
<meta name="msapplication-TileColor" content="#2B5797" />
<meta name="msapplication-tap-highlight" content="no" />
<meta name="theme-color" content="#000000" />

<link rel="apple-touch-icon" href="/icons/touch-icon-iphone.png" />
<link
  rel="apple-touch-icon"
  sizes="152x152"
  href="/icons/touch-icon-ipad.png"
/>
<link
  rel="apple-touch-icon"
  sizes="180x180"
  href="/icons/touch-icon-iphone-retina.png"
/>
<link
  rel="apple-touch-icon"
  sizes="167x167"
  href="/icons/touch-icon-ipad-retina.png"
/>

<link
  rel="icon"
  type="image/png"
  sizes="32x32"
  href="/icons/favicon-32x32.png"
/>
<link
  rel="icon"
  type="image/png"
  sizes="16x16"
  href="/icons/favicon-16x16.png"
/>
<link rel="manifest" href="/manifest.json" />
<link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#5bbad5" />
<link rel="shortcut icon" href="/favicon.ico" />
```

## Offline Fallbacks

To handle offline scenarios, add an `/_offline` page (e.g., `pages/_offline.js`). This page will be served when network requests fail.

## Configuration

Customize the plugin behavior by adding a `pwa` object to your `next.config.js`:

```javascript
const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  scope: "/",
  sw: "sw.js",
  runtimeCaching: [
    {
      urlPattern: ({ request }) => request.destination === "image",
      handler: "CacheFirst",
      options: {
        cacheName: "images-cache",
        expiration: {
          maxEntries: 50,
        },
      },
    },
  ],
  publicExcludes: ["!noprecache/**/*"],
  buildExcludes: [/chunks\/images\/.*$/],
  cacheStartUrl: true,
  dynamicStartUrl: true,
  fallbacks: {
    document: "/_offline",
    image: "/static/images/fallback.png",
  },
  cacheOnFrontEndNav: false,
  reloadOnOnline: true,
  customWorkerDir: "worker",
});

module.exports = withPWA({
  // Next.js configuration
});
```

### Available Options

- `dest`: Directory to output service worker files (default: `public`)
- `disable`: Disable PWA features (default: `false`)
- `register`: Automatically register the service worker (default: `true`)
- `scope`: URL scope for the PWA (default: `/`)
- `sw`: Service worker file name (default: `sw.js`)
- `runtimeCaching`: Custom caching strategies
- `publicExcludes`: Exclude files from precaching in the `public` directory
- `buildExcludes`: Exclude files from precaching in the build directory
- `cacheStartUrl`: Cache the start URL (default: `true`)
- `dynamicStartUrl`: Handle dynamic start URLs (default: `true`)
- `fallbacks`: Configure fallback routes for different resource types
- `cacheOnFrontEndNav`: Enable additional caching during front-end navigation
- `reloadOnOnline`: Reload the page when network connection is restored (default: `true`)
- `customWorkerDir`: Directory for custom worker implementations

## Advanced Usage

### Custom Workers

For additional functionality, create a custom worker in the specified directory (default: `worker`):

```
your-project/
  worker/
    index.js
```

### Debugging

- Clean application cache frequently to avoid flaky errors.
- Format the generated `sw.js` for easier debugging.
- Use `self.__WB_DISABLE_DEV_LOGS = true` to disable Workbox logs.

## Reference

- [Google Workbox Documentation](https://developer.chrome.com/docs/workbox/)
- [Service Worker Lifecycle](https://developers.google.com/web/fundamentals/primers/service-workers/lifecycle)

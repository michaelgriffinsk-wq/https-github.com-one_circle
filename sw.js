const CORE_CACHE = 'one-circle-core-v1';
const MEDIA_CACHE = 'user-downloads-v1'; // We will use this later for selective downloads

// The "App Shell" - These files download automatically in the background
const CORE_ASSETS = [
    '/https-github.com-one_circle/',
    '/https-github.com-one_circle/index.html',
    '/https-github.com-one_circle/about.html',
    '/https-github.com-one_circle/projects.html',
    '/https-github.com-one_circle/playlist.html',
    '/https-github.com-one_circle/gallery.html',
    '/https-github.com-one_circle/player.js',
    '/https-github.com-one_circle/database.json',
    '/https-github.com-one_circle/manifest.json'
];


// 1. INSTALL EVENT: Automatically cache the core visual assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CORE_CACHE).then((cache) => {
            console.log('One Circle: Caching App Shell');
            return cache.addAll(CORE_ASSETS);
        })
    );
    self.skipWaiting(); // Forces the app to update immediately when you push new code
});

// 2. ACTIVATE EVENT: Clean up old cache versions if you ever update the site
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CORE_CACHE && cacheName !== MEDIA_CACHE) {
                        console.log('One Circle: Clearing old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// 3. FETCH EVENT: The Traffic Controller
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);
    
    // Check if the request is for an audio or video file
    const isMedia = url.pathname.endsWith('.mp3') || url.pathname.endsWith('.mp4') || url.pathname.endsWith('.m4a') || url.pathname.endsWith('.wav');

    if (isMedia) {
        // MEDIA STRATEGY: Check the 'user-downloads' cache first. 
        // If it's there, play it completely offline! If not, stream it using cellular/Wi-Fi.
        event.respondWith(
            caches.match(event.request, { cacheName: MEDIA_CACHE }).then((cachedMedia) => {
                if (cachedMedia) {
                    console.log('Playing offline track:', url.pathname);
                    return cachedMedia;
                }
                return fetch(event.request);
            })
        );
    } else {
        // CORE STRATEGY: For HTML, JS, and JSON, check the core cache first.
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                // Return cached version if found, otherwise go to the internet
                return cachedResponse || fetch(event.request);
            })
        );
    }
});


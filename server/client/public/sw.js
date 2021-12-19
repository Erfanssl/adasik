function readData(st) {
    const openRequestMessage = indexedDB.open('training-store', 1);
    return new Promise((resolve, reject) => {
        openRequestMessage.onsuccess = function () {
            const db = openRequestMessage.result;
            const tx = db.transaction(st, 'readonly');
            const store = tx.objectStore(st);
            const req = store.getAll();

            req.onerror = err => reject(err);
            req.onsuccess = () => resolve(req.result);
        }
    });
}

function deleteData(st, data) {
    const openRequestMessage = indexedDB.open('training-store', 1);
    return new Promise((resolve, reject) => {
        openRequestMessage.onsuccess = function () {
            const db = openRequestMessage.result;
            const tx = db.transaction(st, 'readwrite');
            const store = tx.objectStore(st);
            const req = store.delete(data);

            req.onerror = err => reject(err);
            req.onsuccess = () => resolve('Data removed!');
        }
    });
}

const VERSION = '15';

const STATIC_CACHE_NAME = 'static-v' + VERSION;
const DYNAMIC_CACHE_NAME = 'dynamic-v' + VERSION;

const CACHE_FILES = [
    '/',
    '/dashboard',
    '/profile',
    '/messenger',
    '/training',
    '/training/anticipation',
    '/training/mental-flex',
    '/training/memory-racer',
    '/challenges',
    '/group',
    '/tests',
    '/friends',
    '/statistics',
    '/*.js',
    '/offline.html',
    '/images/cross.6d28e1d6eab883d7d691e5ed051dcbb8.svg',
    '/images/check.5888e0102fa9f7ce769102ed7829026c.svg',
    '/images/false.14217337ebb315f7b9993ce8a2774af2.mp3',
    '/images/true.8ae69369e20c12219f2ef8487a486511.mp3',
    '/images/blue-circle.0df76f51cd0951c604e5087382666fb9.svg',
    '/images/blue-3D-rectangle.8b610f678368f05e7e832f2a675cfb8e.svg',
    '/images/Button-Green.902ae7dc7b86444717557bd0efbc18c0.svg',
    '/images/Colorful-lines.7158370d4266029ba7e396e626d021e2.svg',
    '/images/Diamond-card-sign.67675d909bcc61a097db16a7d673f984.svg',
    '/images/Gloss-cyan-square.6856954334155d9b449c8788b2fe2cb4.svg',
    '/images/Gloss-violet-square.dd2d56513f876dedf7c2120823b7c4c5.svg',
    '/images/left_arrow.401b6539cebab96e23aae8d1de429640.svg',
    '/images/woven.bb9ae16a21a8754a71bf11f4d61d1a71.png',
    '/images/illusion.ce61b33919ed159a72c595dc53a6f14f.png'
];


self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME)
            .then(cache => {
                setTimeout(() => {
                    CACHE_FILES.forEach(file => {
                        cache.add(file)
                            .then()
                            .catch();
                    });
                }, 3000);
            })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keyList => {
                return Promise.all(keyList.map(key => {
                    if (key !== STATIC_CACHE_NAME && key !== DYNAMIC_CACHE_NAME) {
                        return caches.delete(key);
                    }
                }));
            })
    );

    return self.clients.claim();
});


self.addEventListener('fetch', event => {
    let fetchResponse;

    // event.respondWith(
    //     fetch(event.request)
    //         .catch(err => {
    //             console.log('err is', err);
    //             return caches.match(event.request)
    //                 .then(res => {
    //                     if (res) return res;
    //                     return fetch(event.request)
    //                 })
    //                 .then(response => {
    //                     fetchResponse = response;
    //                     return caches.open(DYNAMIC_CACHE_NAME);
    //                 })
    //                 .then(cache => {
    //                     if (event.request.method === 'GET') {
    //                         cache.put(event.request, fetchResponse.clone());
    //                         return fetchResponse;
    //                     }
    //                 })
    //                 .catch(err => {
    //                     return caches.match('/offline.html');
    //                 })
    //         })
    //
    // );

    event.respondWith(
        fetch(event.request)
            .then(res => {
                fetchResponse = res;
                if (event.request.method === 'GET') {
                    return caches.open(DYNAMIC_CACHE_NAME);
                }
            })
            .then(cache => {
                if (cache !== undefined) cache.put(event.request, fetchResponse.clone());
                return fetchResponse;
            })
            .catch(err => {
                return caches.match(event.request)
                    .then(res => {
                        if (res) return res;
                        return caches.match('/offline.html');
                    })
                    .catch(err => {
                        return caches.match('/offline.html');
                    })
            })

    );
});

self.addEventListener('push', event => {
    const fallbackData = { title: 'No title!' };
    let data;

    if (event.data) data = JSON.parse(event.data.text());
    else data = fallbackData;

    const options = {
        body: data.content,
        icon: '/icons/adasik-logo-256x256.png',
        image: '',
        vibrate: [100, 50, 100],
        data: {
            url: data.openUrl
        },
        tag: 'confirm-notification',
        renotify: true,
        actions: [
            { action: 'confirm', title: 'Okay', icon: '/icons/adasik-logo-96x96.png' },
            { action: 'cancel', title: 'Cancel', icon: '/icons/adasik-logo-96x96.png' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', event => {
    const notification = event.notification;
    const action = event.action;

    if (action === 'confirm' /* action-id that we specified */) {
        clients.openWindow(notification.data.url);
        notification.close(); // Closes the notification.
    } else {
        event.waitUntil(
            // clients --> all browsers related to this sw
            clients.matchAll()
                .then(function (clis) {
                    // We want to identify the open windows in our app
                    const client = clis.find(function (c) {
                        return c.visibilityState === 'visible'; // means open browser window
                    }); // to get the first one

                    if (client !== undefined) {
                        // opens a new tab --> because this client had our app opened
                        client.navigate(notification.data.url);
                        // to focus that window
                        client.focus();
                    } else {
                        // Will open a new window, because these clients didn't have our app opened
                        clients.openWindow(notification.data.url);
                    }

                    notification.close();
                })
        );
        notification.close();
    }
});
self.addEventListener('notificationonclose', event => {});

// background sync
self.addEventListener('sync', event => {
    if (event.tag === 'sync-training-result') {

        async function fetchAndSaveData() {
            try {
                const dataArr = await readData('trainings');
                const dataReqs = dataArr.map(data => {
                    return fetch(`/api/training/finish`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(data)
                    });
                });

                await Promise.all(dataReqs);
                // now we delete them
                const dataDeleteReqs = dataArr.map(data => deleteData('trainings', data.gameName));
                await Promise.all(dataDeleteReqs);
            } catch (err) {

            }
        }

        event.waitUntil(
            fetchAndSaveData()
        );
    }
});

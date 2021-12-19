const openRequestMessage = indexedDB.open('training-store', 1);

openRequestMessage.onupgradeneeded = function () {
    const db = openRequestMessage.result;

    if (!db.objectStoreNames.contains('trainings')) {
        db.createObjectStore('trainings', {
            keyPath: 'gameName'
        });
    }
}

openRequestMessage.onerror = function (err) {
    console.log('Error from opening the IndexDB: ', err);
}

export function writeData(st, data) {
    const openRequestMessage = indexedDB.open('training-store', 1);
    return new Promise((resolve, reject) => {
        openRequestMessage.onsuccess = function () {
            const db = openRequestMessage.result;
            const tx = db.transaction(st, 'readwrite');
            const store = tx.objectStore(st);
            const req = store.put(data);

            req.onerror = err => reject(err);
            req.onsuccess = () => resolve('Data added!');
        }
    });
}

export function deleteData(st, data) {
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

export function readData(st) {
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

export function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
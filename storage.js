// IndexedDB Storage System
const storage = {
    dbName: 'TreeTrackerDB',
    db: null,

    init: async function() {
        return new Promise((resolve) => {
            const request = indexedDB.open(this.dbName, 1);
            request.onerror = () => resolve(false);
            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(true);
            };
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('data')) {
                    db.createObjectStore('data', { keyPath: 'key' });
                }
            };
        });
    },

    get: async function(key) {
        try {
            if (this.db) {
                return new Promise((resolve) => {
                    const tx = this.db.transaction(['data'], 'readonly');
                    const store = tx.objectStore('data');
                    const req = store.get(key);
                    req.onsuccess = () => resolve(req.result ? req.result.value : null);
                    req.onerror = () => resolve(localStorage.getItem(key));
                });
            }
            return localStorage.getItem(key);
        } catch (e) {
            return localStorage.getItem(key);
        }
    },

    set: async function(key, value) {
        try {
            if (this.db) {
                return new Promise((resolve) => {
                    const tx = this.db.transaction(['data'], 'readwrite');
                    const store = tx.objectStore('data');
                    const req = store.put({ key, value });
                    req.onsuccess = () => resolve(true);
                    req.onerror = () => {
                        localStorage.setItem(key, value);
                        resolve(true);
                    };
                });
            }
            localStorage.setItem(key, value);
            return true;
        } catch (e) {
            localStorage.setItem(key, value);
            return true;
        }
    }
};

storage.init();

// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    send: (channel, data) => {
        // whitelist channels if necessary
        ipcRenderer.send(channel, data);
    },
    on: (channel, listener) => {
        ipcRenderer.on(channel, listener);
    },
    once: (channel, listener) => {
        ipcRenderer.once(channel, listener);
    },
    removeAllListeners: (channel) => {
        ipcRenderer.removeAllListeners(channel);
    }
});
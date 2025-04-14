document.addEventListener("DOMContentLoaded", () => {
    const ipcRenderer = window.electronAPI;
    const notificationBanner = document.getElementById('notificationBanner');

    function showNotification(message, type = 'info') {
        if (!notificationBanner) return;
        notificationBanner.textContent = message;
        notificationBanner.style.backgroundColor = (type === 'error') ? '#f44336' : '#2196F3';
        notificationBanner.style.cursor = 'default';
        notificationBanner.style.transform = 'translateX(100%)';
        notificationBanner.style.opacity = '0';
        notificationBanner.style.display = 'block';
        setTimeout(() => {
            notificationBanner.style.transform = 'translateX(0)';
            notificationBanner.style.opacity = '1';
        }, 50);
        setTimeout(() => {
            notificationBanner.style.transform = 'translateX(100%)';
            notificationBanner.style.opacity = '0';
        }, 5000);
    }

    // Listen for update events sent from the main process
    ipcRenderer.on('update-available', () => {
        showNotification('Update available. It will be downloaded automatically.', 'info');
    });
    ipcRenderer.on('update-not-available', () => {
        showNotification('You are on the latest version.');
    });
    ipcRenderer.on('update-downloaded', () => {
        showNotification('Update downloaded. Restarting to install...', 'info');
        // Optionally, you can automatically trigger the installation here:
        ipcRenderer.send('install-update');
    });
    ipcRenderer.on('update-error', (_, err) => {
        console.error('Update error:', err);
        showNotification('Error checking for updates.', 'error');
    });
});
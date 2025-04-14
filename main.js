const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const isDev = require('electron-is-dev');
const log = require('electron-log');
const { autoUpdater } = require('electron-updater');
const dns = require('dns');

// Configure logging level and set logger for autoUpdater.
log.transports.file.level = 'info';
autoUpdater.logger = log;

let mainWindow;
let backendProcess;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1920,
        height: 1080,
        frame: true,
        resizable: true,
        minimizable: true,
        maximizable: true,
        autoHideMenuBar: true,
        icon: path.join(__dirname, 'src', 'frontend', 'static', 'assets', 'Applogo.ico'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    mainWindow.setMenuBarVisibility(false);
    mainWindow.maximize();

    // Once ready, set fixed window size for proper layout.
    mainWindow.on('ready-to-show', () => {
        const { width, height } = mainWindow.getBounds();
        mainWindow.setMinimumSize(width, height);
        mainWindow.setMaximumSize(width, height);
    });

    mainWindow.loadFile(path.join(__dirname, 'src', 'frontend', 'templates', 'index.html'));

    // Disable refresh shortcuts (Ctrl+R, F5) to avoid accidental refreshes.
    mainWindow.webContents.on('before-input-event', (e, input) => {
        if ((input.control && input.key.toLowerCase() === 'r') || input.key === 'F5') {
            e.preventDefault();
        }
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
        if (backendProcess) backendProcess.kill();
    });
}

function startBackend() {
    // Use different executable path based on development mode.
    const exe = isDev
        ? path.join(__dirname, 'src', 'backend', 'dist', 'main.exe')
        : path.join(process.resourcesPath, 'backend', 'main.exe');

    const cwd = isDev
        ? path.join(__dirname, 'src', 'backend', 'dist')
        : path.join(process.resourcesPath, 'backend');

    log.info(`Starting backend: ${exe}`);
    backendProcess = spawn(exe, [], { cwd });

    backendProcess.stdout.on('data', data => log.info(`Backend: ${data}`));
    backendProcess.stderr.on('data', data => log.error(`Backend ERR: ${data}`));
    backendProcess.on('close', code => log.info(`Backend exited: ${code}`));
}

// Helper function to check for internet connection.
function checkInternet(callback) {
    dns.lookup('github.com', (err) => {
        callback(!err);
    });
}

function setupAutoUpdater() {
    if (!isDev) {
        // Only check for updates in production if online.
        checkInternet((isOnline) => {
            if (isOnline) {
                log.info('Internet available. Checking for updates.');
                autoUpdater.checkForUpdatesAndNotify();
            } else {
                log.info('No internet connection. Skipping update check.');
            }
        });

        // AutoUpdater Event Listeners
        autoUpdater.on('checking-for-update', () => {
            log.info('Checking for update...');
            mainWindow?.webContents?.send('update-checking');
        });

        autoUpdater.on('update-available', () => {
            log.info('Update available');
            mainWindow?.webContents?.send('update-available');
        });

        autoUpdater.on('update-not-available', () => {
            log.info('No update available');
            mainWindow?.webContents?.send('update-not-available');
        });

        autoUpdater.on('download-progress', progress => {
            log.info(`Download speed: ${progress.bytesPerSecond} - ${Math.round(progress.percent)}%`);
            mainWindow?.webContents?.send('download-progress', progress);
        });

        // After update downloaded, clear session cache and then install
        autoUpdater.on('update-downloaded', () => {
            log.info('Update downloaded. Clearing cache and preparing to install.');
            if (mainWindow) {
                mainWindow.webContents.session.clearCache()
                    .then(() => {
                        log.info('Cache cleared successfully.');
                        mainWindow?.webContents?.send('update-downloaded');
                        // Delay installation briefly to allow user notification to appear
                        setTimeout(() => {
                            autoUpdater.quitAndInstall();
                        }, 3000);
                    })
                    .catch((err) => {
                        log.error('Error clearing cache:', err);
                        // If cache clearing fails, install update anyway
                        autoUpdater.quitAndInstall();
                    });
            }
        });

        autoUpdater.on('error', err => {
            log.error('AutoUpdater error:', err);
            mainWindow?.webContents?.send('update-error', err == null ? 'unknown' : err.message);
        });
    } else {
        // In development mode, simulate a "no update available" event after 5 seconds.
        setTimeout(() => {
            log.info('Development mode: Simulating update-not-available.');
            mainWindow?.webContents?.send('update-not-available');
        }, 5000);
    }
}

app.whenReady().then(() => {
    startBackend();
    // Delay window creation slightly to allow backend startup.
    setTimeout(createWindow, 5000);
    setupAutoUpdater();
});

app.on('window-all-closed', () => {
    // On macOS, apps generally remain active until explicitly quit.
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On macOS, re-create a window in case none are open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// Global error handling.
process.on('uncaughtException', err => log.error('Uncaught Exception:', err));

// Ensure that the backend process is terminated when the app quits.
app.on('will-quit', () => {
    if (backendProcess) backendProcess.kill();
});

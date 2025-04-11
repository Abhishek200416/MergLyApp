const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const isDev = require('electron-is-dev');
const { autoUpdater } = require('electron-updater');

let mainWindow;
let backendProcess;

// Create the main application window
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1024,
        height: 768,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    // Load the frontend UI from a local file (no visible "localhost" URL)
    mainWindow.loadFile(path.join(__dirname, 'frontend', 'templates', 'index.html'));

    mainWindow.on('closed', () => {
        mainWindow = null;
        if (backendProcess) {
            backendProcess.kill();
        }
    });
}

// Start the backend executable (built with PyInstaller)
function startBackend() {
    // In development, expect the exe at __dirname/dist/main.exe,
    // in production it's packaged within process.resourcesPath.
    const backendExecutable = isDev ?
        path.join(__dirname, 'dist', 'main.exe') :
        path.join(process.resourcesPath, 'main.exe');

    console.log(`Starting backend from: ${backendExecutable}`);

    backendProcess = spawn(backendExecutable, []);

    // Log backend output for debugging
    backendProcess.stdout.on('data', (data) => {
        console.log(`Backend stdout: ${data}`);
    });
    backendProcess.stderr.on('data', (data) => {
        console.error(`Backend stderr: ${data}`);
    });
    backendProcess.on('close', (code) => {
        console.log(`Backend process exited with code ${code}`);
    });
}

// Setup auto-updates using electron-updater and GitHub Releases
function setupAutoUpdates() {
    autoUpdater.checkForUpdatesAndNotify();
    autoUpdater.on('update-available', () => {
        console.log('Update available. Downloading update...');
    });
    autoUpdater.on('update-downloaded', () => {
        console.log('Update downloaded. Installing update...');
        autoUpdater.quitAndInstall();
    });
    autoUpdater.on('error', (err) => {
        console.error(`Auto updater error: ${err}`);
    });
}

// When the app is ready, start the backend, create the window, and check updates
app.whenReady().then(() => {
    startBackend();
    // Allow some time for the backend to start before loading the UI
    setTimeout(createWindow, 2000);

    if (!isDev) {
        setupAutoUpdates();
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
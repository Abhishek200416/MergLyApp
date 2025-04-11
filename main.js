const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const isDev = require('electron-is-dev');
const { autoUpdater } = require('electron-updater');

let mainWindow;
let backendProcess;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1024,
        height: 768,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.loadFile(path.join(__dirname, 'frontend', 'templates', 'index.html'));

    mainWindow.on('closed', () => {
        mainWindow = null;
        if (backendProcess) {
            backendProcess.kill();
        }
    });
}

function startBackend() {
    const backendExecutable = isDev ?
        path.join(__dirname, 'dist', 'main.exe') :
        path.join(process.resourcesPath, 'backend', 'main.exe');

    const workingDir = isDev ?
        path.join(__dirname, 'dist') :
        path.join(process.resourcesPath, 'backend');

    console.log(`Starting backend from: ${backendExecutable}`);

    backendProcess = spawn(backendExecutable, [], { cwd: workingDir });

    backendProcess.stdout.on('data', (data) => {
        console.log(`Backend stdout: ${data}`);
    });

    backendProcess.stderr.on('data', (data) => {
        console.error(`Backend stderr: ${data}`);
    });

    backendProcess.on('close', (code) => {
        console.log(`Backend exited with code ${code}`);
    });
}

function setupAutoUpdates() {
    autoUpdater.checkForUpdatesAndNotify();

    autoUpdater.on('update-available', () => {
        console.log('Update available. Downloading...');
    });

    autoUpdater.on('update-downloaded', () => {
        console.log('Update downloaded. Installing...');
        autoUpdater.quitAndInstall();
    });

    autoUpdater.on('error', (err) => {
        console.error(`Auto updater error: ${err}`);
    });
}

app.whenReady().then(() => {
    startBackend();
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

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

app.on('will-quit', () => {
    if (backendProcess) backendProcess.kill();
});
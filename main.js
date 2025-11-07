const { app, BrowserWindow, Menu } = require('electron')
const path = require('path')

// Set the application name
app.setName('FastWords')

// Conditionally include hot reloading in development
if (!app.isPackaged) {
    try {
        require('electron-reloader')(module, {
            watchRenderer: true,
            ignore: ['node_modules', '.git'],
            debug: true
        })
    } catch (_) { }
}

// Create a simplified menu for macOS with only basic items
const createMenu = () => {
    const template = [
        {
            label: 'FastWords',
            submenu: [
                { role: 'about' },
                { type: 'separator' },
                { role: 'services' },
                { type: 'separator' },
                { role: 'hide' },
                { role: 'hideOthers' },
                { role: 'unhide' },
                { type: 'separator' },
                { role: 'quit' }
            ]
        },
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                { role: 'pasteAndMatchStyle' },
                { role: 'delete' },
                { role: 'selectAll' }
            ]
        },
        {
            label: 'Window',
            submenu: [
                { role: 'minimize' },
                { role: 'zoom' },
                { type: 'separator' },
                { role: 'front' }
            ]
        }
    ]

    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
}

const createWindow = () => {
    const win = new BrowserWindow({
        width: 900,
        height: 700,
        titleBarStyle: 'hidden',
        minWidth: 800,
        minHeight: 700,
        maxWidth: 1000,
        maxHeight: 800,
        transparent: true,
        icon: path.join(__dirname, 'src/logo.png')
    })

    win.loadFile('src/index.html')
}

app.whenReady().then(() => {
    createWindow()
    createMenu()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})
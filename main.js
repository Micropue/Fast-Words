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
                { role: 'about', label: '关于 FastWords' },
                { type: 'separator' },
                { role: 'services', label: '服务' },
                { type: 'separator' },
                { role: 'hide', label: '隐藏 FastWords' },
                { role: 'hideOthers', label: '隐藏其他' },
                { role: 'unhide', label: '显示全部' },
                { type: 'separator' },
                { role: 'quit', label: '退出' }
            ]
        },
        {
            label: '文件',
            submenu: [
                {
                    label: '关闭窗口',
                    accelerator: 'CmdOrCtrl+W',
                    click: () => {
                        const focusedWindow = BrowserWindow.getFocusedWindow();
                        if (focusedWindow) {
                            focusedWindow.close();
                        }
                    }
                },
                { type: 'separator' },
            ]
        },
        {
            label: '编辑',
            submenu: [
                { role: 'undo', label: '撤销' },
                { role: 'redo', label: '重做' },
                { type: 'separator' },
                { role: 'cut', label: '剪切' },
                { role: 'copy', label: '拷贝' },
                { role: 'paste', label: '粘贴' },
                { role: 'pasteAndMatchStyle', label: '粘贴并匹配样式' },
                { role: 'delete', label: '删除' },
                { role: 'selectAll', label: '全选' }
            ]
        },
        {
            label: '窗口',
            submenu: [
                { role: 'minimize', label: '最小化' },
                { role: 'zoom', label: '缩放' },
                { type: 'separator' },
                { role: 'front', label: '前置全部窗口' },
            ]
        },
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
const electronApp = require('electron').app;
const electronBrowserWindow = require('electron').BrowserWindow;
const electronMenu = require('electron').Menu;
const electronIpcMain = require('electron').ipcMain;
const Store = require('electron-store');
const store = new Store();
const path = require('path');
const db = require('./connection.js');
let window;
let loginWindow;

//Default Process
//Default Process
//Default Process
if (process.env.NODE_ENV !== 'production') {
  require('electron-reload')(__dirname, {
    electron: path.join(__dirname, '../node_modules', '.bin', 'electron')
  });
  require('electron-reload')(__dirname, {
    electron_forge: path.join(__dirname, '../node_modules', '.bin', 'electron-forge')
  });
}

if (require('electron-squirrel-startup')) {
  electronApp.quit();
}

//Windows Create
//Windows Create
//Windows Create
const createWindowDashboard = () => {
  window = new electronBrowserWindow({
    icon: __dirname + '/assets/images/favicon.ico',
    width: 900,
    height: 600,
    autoHideMenuBar: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      devTools: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });


  window.loadFile(path.join(__dirname, 'views/index.html'));
  window.webContents.openDevTools()
};

const createWindow = () => {
  loginWindow = new electronBrowserWindow({
    icon: __dirname + '/assets/images/favicon.ico',
    width: 550,
    height: 470,
    resizable: false,
    maximizable: false,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      devTools: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // and load the index.html of the app.
  loginWindow.loadFile(path.join(__dirname, 'views/login.html'));
};

//Querys/Consult SQL
//Querys/Consult SQL
//Querys/Consult SQL 
function getAlumnos() {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM alumnos';

    db.all(sql, (error, rows) => {
      if (error) {
        reject(error);
        return;
      }

      if (rows) {
        const alumnos = rows.map(detalle => ({
          nombre: detalle.nombre,
          rut: detalle.rut,
          curso: detalle.curso,
          img: detalle.img,
          password: detalle.password
        }));

        store.set('alumnos', alumnos);
        resolve();
      }
    });
  });
};


function validateLogin(data) {
  const sql = 'SELECT * FROM usuarios WHERE user=? AND password=?';

  db.get(sql, [data.email, data.password], (error, row) => {
    if (error) {
      console.log(error);
    }

    if (row) {
      store.set('user', row.user);
      createWindowDashboard();
      loginWindow.close();
      window.loadFile(path.join(__dirname, 'views/index.html'));
      window.maximize();
      window.show();
    }
  });
}

//Electron Functions
//Electron Functions
//Electron Functions
electronApp.on('ready', createWindow);
electronApp.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    electronApp.quit();
  }
});
electronApp.on('activate', () => {
  if (electronBrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

electronIpcMain.on('login', (event, data) => {
  validateLogin(data);
});

electronIpcMain.on('logout', (event, confirm) => {
  validateLogout(confirm);
});


//Electron Functions callback back -> front
//Electron Functions callback back -> front
//Electron Functions callback back -> front
electronIpcMain.handle('getUserData', async (event) => {
  try {
    const alumnosPromise = getAlumnos();
    await Promise.all([alumnosPromise]);

    // Obtiene los datos del store y los devuelve
    const data = {
      name: store.get('user'),
      alumnos: store.get('alumnos')
    };

    return data;
  } catch (error) {
    console.error('Error al obtener los datos del usuario:', error);
    throw error;
  }
});


//Electron Functions Send front -> back
//Electron Functions Send front -> back
//Electron Functions Send front -> back
electronIpcMain.on('viewBoleta', (event, data) => {
  store.set('boleta', data)
  viewBoleta();
});


//Any Functions
//Any Functions
//Any Functions
function validateLogout(confirm) {
  if (confirm == 'confirm-logout') {
    store.delete('name');

    createWindow();
    loginWindow.show();
    window.close();
  }
}
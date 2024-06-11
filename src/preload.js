const { contextBridge, ipcRenderer, shell } = require('electron');
const puppeteer = require('puppeteer');

const ipc = {
    'render': {
        'send': [ // Esto me envía datos a mi electron.js
            'login',
            'logout',
            'insertProducto',
            'updateProducto',
            'deleteProducto',
            'saveCarrito',
            'deleteCarrito',
            'generarBoleta',
            'viewBoleta',
        ],
        'sendReceive': [ // Esto me trae datos a mi HTML
            'getUserData',
            'getCarrito',
            'getBoleta',
        ]
    }
};

async function loginUmaximo(rut, password) {
    console.log('Login attempt with:', rut, password);

    const url = 'https://umaximo.com/login';

    // Launch a new browser instance
    const browser = await puppeteer.launch({
        headless: false,
        args: [
            '--start-maximized' // Start the browser maximized
        ],
        defaultViewport: null // Use null to disable the default viewport
    });
    const page = await browser.newPage();

    // Maximize the browser window
    const [width, height] = await page.evaluate(() => [window.screen.availWidth, window.screen.availHeight]);
    await page.setViewport({ width, height });

    // Navigate to the login page
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Enter the RUT and password
    await page.type('input[name="key"]', rut); // Select the RUT input field
    await page.type('input[name="password"]', password); // Select the password input field

    // Click the login button
    await page.click('button[type="submit"]'); // Assuming the login button is of type submit

    // Wait for navigation after login
    await page.waitForNavigation();

    console.log('Logged in successfully');

    // Optionally, close the browser after logging in
    // await browser.close();
}

contextBridge.exposeInMainWorld(
    'ipcRender', {
        send: (channel, args) => {
            let validChannels = ipc.render.send;

            if (validChannels.includes(channel)) {
                ipcRenderer.send(channel, args);
            }
        },
        invoke: (channel, args) => {
            let validChannels = ipc.render.sendReceive;

            if (validChannels.includes(channel)) {
                return ipcRenderer.invoke(channel, args);
            }
        },
        loginUmaximo: (rut, password) => loginUmaximo(rut, password)
    }
);

let dataProducto; // Variable global para almacenar la instancia de dataProducto
let page;
let data;
document.addEventListener('DOMContentLoaded', function () {
    page = new Page(window);
});

class Page {
    constructor() {
        this.attachEvents();
        this.loadDataUser();
    }

    get(id) {
        return document.querySelector(id);
    }

    attachEvents() {
        // Agrega un evento de clic al botón de actualización si tienes uno
        const refreshButton = this.get('#refreshButton');
        if (refreshButton) {
            refreshButton.addEventListener('click', this.refresh.bind(this));
        }

        let btnLogout = this.get('#btnLogout');
        btnLogout.addEventListener('click', this.logout);
    }

    loadDataUser() {
        let profileName = document.getElementById('nombreUser');

        window.ipcRender.invoke('getUserData').then((result) => {
            data = result
            if (result.permissions == 'admin') {
                if (result.categorias && result.categorias.length > 0) {
                    const categorySelect = document.getElementById('productCategorySelect');
                    categorySelect.innerHTML = ''; // Limpiar opciones existentes

                    result.categorias.forEach(categoria => {
                        const option = document.createElement('option');
                        option.value = categoria.nombre; // Asignar el nombre de la categoría como valor
                        option.textContent = categoria.nombre; // Asignar el nombre de la categoría como texto visible
                        categorySelect.appendChild(option);
                    });
                }
            }
        });
    }

    refresh() {
        // Vuelve a cargar los datos del usuario
        this.loadDataUser();
    }

    logout() {
        window.ipcRender.send('logout', 'confirm-logout');
    }
}

let buscar = false;

async function buscarProducto() {
    const barcode = document.getElementById('barcodeInput').value;
    const url = `https://go-upc.com/search?q=${barcode}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`La solicitud a ${url} falló con estado ${response.status}`);
        }

        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const productNameElement = doc.querySelector('h1.product-name');
        const imageElement = doc.querySelector('figure.product-image.mobile img');
        const barcodeTableElement = doc.querySelector('table.table.table-striped td.metadata-label');

        if (productNameElement) {
            const productName = productNameElement.textContent.trim();
            document.getElementById('productNameInput').value = productName;
        } else {
            throw new Error('No se encontró el elemento .product-name en la respuesta HTML');
        }

        if (imageElement) {
            const imageUrl = imageElement.getAttribute('src');
            const imageUrlInput = imageElement.getAttribute('src');
            document.getElementById('productImageInput').value = imageUrlInput;
            document.getElementById('productImagePreview').setAttribute('src', imageUrl);
        } else {
            throw new Error('No se encontró el elemento de imagen en la respuesta HTML');
        }

        if (barcodeTableElement && barcodeTableElement.textContent.trim() === 'EAN') {
            const barcodeNumber = barcodeTableElement.nextElementSibling.textContent.trim();
            document.getElementById('productBarcodeInput').value = barcodeNumber;
        } else {
            throw new Error('No se encontró el número de código de barras en la respuesta HTML');
        }

        // Habilitar los inputs después de obtener la información del producto
        document.getElementById('productNameInput').disabled = false;
        document.getElementById('productPriceInput').disabled = false;
        //document.getElementById('productBarcodeInput').disabled = false;
        document.getElementById('productCategorySelect').disabled = false;
        document.getElementById('productImageInput').disabled = false;
    } catch (error) {
        console.error('Ha ocurrido un error:', error);
    }
}

async function sinBuscar() {
    const buscar = document.getElementById('buscar');
    const nobuscar = document.getElementById('nobuscar');

    const barcodeInput = document.getElementById('barcodeInput');
    const productNameInput = document.getElementById('productNameInput');
    const productPriceInput = document.getElementById('productPriceInput');
    const productBarcodeInput = document.getElementById('productBarcodeInput');
    const productCategorySelect = document.getElementById('productCategorySelect');
    const productImageInput = document.getElementById('productImageInput');

    if (buscar.textContent === 'Continuar con el escaneo') {
        // Restaurar el estado para continuar con el escaneo
        barcodeInput.disabled = false;
        buscar.disabled = false;

        productNameInput.disabled = true;
        productPriceInput.disabled = true;
        productBarcodeInput.disabled = true;
        productCategorySelect.disabled = true;
        productImageInput.disabled = true;

        // Restaurar el texto y el evento del botón
        buscar.textContent = 'Buscar Producto';
        nobuscar.textContent = 'Continuar Sin Escanear'
        buscar.onclick = buscarProducto; // Restablecer el evento de búsqueda
    } else {
        // Deshabilitar la entrada de código de barras y el botón de búsqueda
        barcodeInput.disabled = true;
        buscar.disabled = true;

        // Habilitar los campos de entrada de nombre, precio, código de barras, categoría e imagen
        productNameInput.disabled = false;
        productPriceInput.disabled = false;
        productBarcodeInput.disabled = false;
        productCategorySelect.disabled = false;
        productImageInput.disabled = false;

        // Cambiar el texto y el evento del botón para continuar con el escaneo
        buscar.textContent = 'Continuar con el escaneo';
        nobuscar.textContent = 'Continuar con Escanear'
        buscar.onclick = sinBuscar;
    }
}

function agregarProducto() {
    const productName = document.getElementById('productNameInput').value;
    const productPrice = document.getElementById('productPriceInput').value;
    const productBarcode = document.getElementById('productBarcodeInput').value;
    const productCategory = document.getElementById('productCategorySelect').value;

    if (productName == ''){
        alert('No has ingresado un nombre al producto')
        return;
    }

    // Verificar que el precio sea numérico
    if (isNaN(productPrice)) {
        alert('El precio debe ser numérico.');
        return;
    }else if(productPrice == ''){
        alert('No has ingresado un precio')
        return;
    }

    if (productBarcode == ''){
        alert('No has ingresado un código de barra para el producto')
        return;
    }

    // Verificar que la categoría del producto coincida con alguna de las categorías obtenidas del invoke
    const categoriasObtenidas = data.categorias.map(categoria => categoria.nombre); // Obtener solo los nombres de categoría
    console.log(categoriasObtenidas);
    if (!categoriasObtenidas.includes(productCategory)) {
        alert('La categoría del producto no es válida.');
        return;
    }


    // Si pasa todas las validaciones, puedes añadir el producto
    // Aquí debes agregar el código para añadir el producto a tu base de datos o hacer cualquier otra operación necesaria
    console.log('Producto añadido:', {
        productName,
        productPrice,
        productBarcode,
        productCategory
    });

    // También puedes restablecer los campos del formulario después de añadir el producto
    document.getElementById('productNameInput').value = '';
    document.getElementById('productPriceInput').value = '';
    document.getElementById('productBarcodeInput').value = '';
    document.getElementById('productCategorySelect').value = '';
    document.getElementById('productImageInput').value = '';
    document.getElementById('productImagePreview').setAttribute('src', '');
}
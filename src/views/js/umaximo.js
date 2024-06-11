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
        window.ipcRender.invoke('getUserData').then((result) => {
            data = result;
            if (result.alumnos && result.alumnos.length > 0) {
                const dataSet = [];
                result.alumnos.forEach((alumno, index) => {
                    if (alumno.img == '' || alumno.img == null || alumno.img == undefined) {
                        alumno.img = './img/user.png';
                    };

                    dataSet.push([
                        alumno.nombre,
                        alumno.rut,
                        alumno.curso,
                        '<img style="width:75px; height:75px;" src="' + alumno.img + '">',
                        '<button type="button" class="btn btn-primary" onclick="page.loginUmaximo(\'' + alumno.rut + '\', \'' + alumno.password + '\')">Iniciar Sesión</button>'
                    ]);
                });

                // Verificar si ya existe una instancia de dataProducto
                if (!dataProducto) {
                    // Inicializar dataProductos con el conjunto de datos construido
                    dataProducto = new DataTable('#productos', {
                        language: {
                            "decimal": "",
                            "emptyTable": "No hay Productos Registrados",
                            "info": "Mostrando _START_ a _END_ de _TOTAL_ Entradas",
                            "infoEmpty": "Mostrando 0 to 0 of 0 Entradas",
                            "infoFiltered": "(Filtrado de _MAX_ total entradas)",
                            "infoPostFix": "",
                            "thousands": ",",
                            "lengthMenu": "Mostrar _MENU_ Entradas",
                            "loadingRecords": "Cargando...",
                            "processing": "Procesando...",
                            "search": "Buscar:",
                            "zeroRecords": "Sin resultados encontrados",
                            "paginate": {
                                "first": "Primero",
                                "last": "Ultimo",
                                "next": "Siguiente",
                                "previous": "Anterior"
                            }
                        },
                        columns: [
                            { title: 'Nombre' },
                            { title: 'R.U.T' },
                            { title: 'Curso' },
                            { title: 'Imagen' },
                            { title: 'Opciones' },
                        ],
                        data: dataSet
                    });
                } else {
                    // Si ya existe una instancia de dataProducto, simplemente actualiza los datos
                    dataProducto.clear().rows.add(dataSet).draw();
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

    loginUmaximo(rut, password) {
        window.ipcRender.loginUmaximo(rut, password);
    }
}

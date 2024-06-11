const sqlite3 = require('sqlite3').verbose();
const XLSX = require('xlsx');

const connection = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Conectado a la base de datos.');
});

connection.serialize(() => {
    connection.run(`CREATE TABLE IF NOT EXISTS usuarios (
              user TEXT PRIMARY KEY,
              password TEXT NOT NULL
            );`, (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Tabla creada exitosamente.');
    });

    let adminUser = 'admin';
    let adminPassword = 'admin';

    connection.run(`INSERT OR IGNORE INTO usuarios(user, password) VALUES(?, ?)`, [adminUser, adminPassword], function (err) {
        if (err) {
            return console.error(err.message);
        }
        console.log(`Usuario '${adminUser}' creado exitosamente.`);
    });

    connection.run(`CREATE TABLE IF NOT EXISTS alumnos (
        nombre TEXT NOT NULL,
        rut TEXT PRIMARY KEY,
        curso TEXT NOT NULL,
        img TEXT,
        password TEXT NOT NULL
      );`, (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Tabla alumnos creada exitosamente.');
    });
});


// Leer el archivo Excel
// Leer el archivo Excel
/*const workbook = XLSX.readFile('C:\\Users\\usuario\\Desktop\\Proyectos Personales\\gestion_alumnos\\src\\views\\alumnos\\alumnos.xlsx');
const sheet_name_list = workbook.SheetNames;
const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);

// Variable para el curso
let curso = '4°B';

// Variable para la contraseña
let password = 'cuartob';

// Insertar los datos en la base de datos
data.forEach(row => {
    let nombre = row['Nombres'] + ' ' + row['Apellidos'];
    let rut = row['Cédula'];

    connection.run(`INSERT INTO alumnos(nombre, rut, curso, img, password) VALUES(?, ?, ?, ?, ?)`, [nombre, rut, curso, '', password], function(err) {
        if (err) {
            return console.error(err.message);
        }
        console.log(`Alumno '${nombre}' agregado exitosamente.`);
    });
});
*/


module.exports = connection;

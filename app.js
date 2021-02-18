const util = require('util');

// Configuracion de express
const express = require('express');
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;


// Configuracion mysql
const mysql = require('mysql');
const conexion = mysql.createConnection({
    host: 'localhost',
    user: 'admin',
    password: 'admin',
    database: 'listacompras'
});



conexion.connect((error) => {
    if (error) {
        throw error;
    }

    console.log('Conexion con la base de datos establecida.');
});

const qy = util.promisify(conexion.query).bind(conexion); // permite uso de async await con mysql


/* 
* CATEGORIAS
* GET para devolver todas las categorias
* GET id para devolver una sola categorias
* POST guardar una categoria nueva
* PUT modificar una categoria
* DELETE borrar una categoria
* 
* RUTA: /categoria
*/

app.get('/categoria', async (req, res) => {
    try {
        const query = 'SELECT * FROM categoria';
        // conexion.query(query, (queryRes) => {
        //     console.log(queryRes);
        // });

        const queryRes = await qy(query);

        res.send({ "respuesta": queryRes });

    }
    catch (e) {
        console.log(e.message);
        res.status(413).send({ "Error": e.message });
    }
});

app.get('/categoria/:id', async (req, res) => {
    try {
        const query = `SELECT * FROM categoria WHERE id = ${req.params.id}`;
        // conexion.query(query, (queryRes) => {
        //     console.log(queryRes);
        // });

        const queryRes = await qy(query);

        res.send({ "respuesta": queryRes });

    }
    catch (e) {
        console.log(e.message);
        res.status(413).send({ "Error": e.message });
    }
});

app.post('/categoria', async (req, res) => {
    try {
        // Valido que me manden correctamente la info
        if (!req.body.nombre) {
            throw new Error('Falta enviar el nombre');
        }

        // Verifico que no exista esa categoria
        let query = `SELECT id FROM categoria WHERE nombre = "${req.body.nombre.toUpperCase()}"`;

        let queryRes = await qy(query);
        if (queryRes.length > 0) {
            throw new Error('La categoria ya existe');
        }
        //Guardo la nueva acategoria
        query = `INSERT INTO categoria (nombre) VALUE ("${req.body.nombre.toUpperCase()}")`;
        console.log(query);
        queryRes = await qy(query);

        console.log(queryRes);
        res.send({ 'respuesta': queryRes.insertId });

    } catch (e) {
        console.log(e.message);
        res.status(413).send({ "Error": e.message });
    }
});


/*
*  PRODUCTOS
*/

/*
* LISTA DE COMPRAS
*/






app.listen(PORT, () => {
    console.log(`Our app is running on port ${PORT}`);
});

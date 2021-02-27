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
        const query = 'SELECT * FROM categoria WHERE id = ?';

        const queryRes = await qy(query, [req.params.id]);

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
        let query = 'SELECT id FROM categoria WHERE nombre = ?';

        let queryRes = await qy(query, [req.body.nombre.toUpperCase()]);
        if (queryRes.length > 0) {
            throw new Error('La categoria ya existe');
        }
        //Guardo la nueva acategoria
        query = 'INSERT INTO categoria (nombre) VALUE (?)';
        queryRes = await qy(query, [req.body.nombre.toUpperCase()]);

        res.send({ 'respuesta': queryRes.insertId });

    } catch (e) {
        console.log(e.message);
        res.status(413).send({ "Error": e.message });
    }
});

app.put('/categoria/:id', async (req, res) => {
    try {
        if (!req.body.nombre) {
            throw new Error('No se envio el nombre');
        }
        let query = 'SELECT * FROM categoria WHERE nombre = ? and id <> ?';
        queryRes = await qy(query, [req.body.nombre, req.params.id]);

        if (queryRes.length > 0) {
            throw new Error(`La categoria ${req.body.nombre} ya existe`);
        }

        query = 'UPDATE categoria SET nombre = ? WHERE id = ?';
        queryRes = await qy(query, [req.body.nombre, req.params.id]);

        res.send({ 'respuesta': queryRes.changedRows });
        console.log(queryRes);

    } catch (e) {
        console.log(e.message);
        res.status(413).send({ "Error": e.message });
    }
});

app.delete('/categoria/:id', async (req, res) => {
    try {

        res.send({ 'respuesta': queryRes });

    } catch (e) {
        console.log(e.message);
        res.status(413).send({ "Error": e.message });
    }


});


/*
*  PRODUCTOS
*/

app.post('/producto', async (req, res) => {
    try {
        if (!req.body.nombre || !req.body.categoria_id) {
            throw new Error('No se enviaron los datos necesarios');
        }

        let query = 'SELECT * FROM categoria WHERE id = ?';
        let queryRes = await qy(query, [req.body.categoria_id]);

        if (queryRes.length == 0) {
            throw new Error("No existe la categoria");
        }

        query = 'SELECT * FROM producto WHERE nombre = ?';
        queryRes = await qy(query, [req.body.nombre]);

        if (queryRes.length > 0) {
            throw new Error("El nombre  de producto ya existe");
        }

        if (!req.body.descripcion) { req.body.descripcion = null };

        query = 'INSERT INTO producto (nombre, descripcion, categoria_id) VALUES (?, ?, ?)';
        queryRes = await qy(query, [req.body.nombre, req.body.descripcion, req.body.categoria_id]);


        res.send({ 'respuesta': queryRes.insertId });



    } catch (e) {
        console.log(e.message);
        res.status(413).send({ "Error": e.message });
    }
});


/*
* LISTA DE COMPRAS
*/






app.listen(PORT, () => {
    console.log(`Our app is running on port ${PORT}`);
});

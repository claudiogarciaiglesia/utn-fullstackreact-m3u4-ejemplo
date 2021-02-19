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
        queryRes = await qy(query);

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
        let query = `SELECT * FROM categoria WHERE nombre = "${req.body.nombre}" and id <> "${req.params.id}"`;
        queryRes = await qy(query);

        if (queryRes.length > 0) {
            throw new Error(`La categoria ${req.body.nombre} ya existe`);
        }

        query = `UPDATE categoria SET nombre = "${req.body.nombre}" WHERE id = "${req.params.id}"`;
        queryRes = await qy(query);

        res.send({ 'respuesta': queryRes.changedRows });
        console.log(queryRes);

    } catch (e) {
        console.log(e.message);
        res.status(413).send({ "Error": e.message });
    }
});

app.delete('/categoria/:id', async (req, res) => {
    try {

        let query = `SELECT * FROM producto WHERE categoria_id = "${req.params.id}"`;
        queryRes = await qy(query);

        console.log(queryRes);
        if (queryRes.length > 0) {
            throw new Error(`No es posible borrar la categoria, existen uno o mas productos relacionados`);
        }

        query = `DELETE FROM categoria WHERE id = "${req.params.id}"`;
        queryRes = await qy(query);

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

        let query = `SELECT * FROM categoria WHERE id = "${req.body.categoria_id}"`;
        let queryRes = await qy(query);

        if (queryRes.length == 0) {
            throw new Error("No existe la categoria");
        }

        query = `SELECT * FROM producto WHERE nombre = "${req.body.nombre}"`;
        queryRes = await qy(query);

        if (queryRes.length > 0) {
            throw new Error("El nombre  de producto ya existe");
        }

        query = `INSERT INTO producto (nombre, descripcion, categoria_id) VALUES ("${req.body.nombre}", ${req.body.descripcion ? '"' + req.body.descripcion + '"' : null}, ${req.body.categoria_id})`;
        queryRes = await qy(query);


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

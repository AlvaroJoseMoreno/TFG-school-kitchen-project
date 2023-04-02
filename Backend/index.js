/*
@Author: Alvaro Jose Moreno Carreras.

Fecha de creacion de fichero: 31-03-2023
*/
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { dbConnection } = require('./database/configdb');
const bodyParser = require('body-parser');
const app = express();

dbConnection();

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

app.use('/api/usuarios', require('./routes/usuario'));
app.use('/api/provincias', require('./routes/provincias'));

app.listen(process.env.PORT, () => {
    console.log('conectado');
    console.log('Servidor corriendo en el puerto ', process.env.PORT);
});
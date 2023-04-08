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

app.use('/api/login', require('./routes/auth'));
app.use('/api/usuarios', require('./routes/usuario'));
app.use('/api/provincias', require('./routes/provincias'));
app.use('/api/colegios', require('./routes/colegios'));
app.use('/api/comensales', require('./routes/comensales'));
app.use('/api/ingredientes', require('./routes/ingredientes'));
app.use('/api/pedidos', require('./routes/pedido'));

app.listen(process.env.PORT, () => {
    console.log('Servidor corriendo en el puerto ', process.env.PORT);
});
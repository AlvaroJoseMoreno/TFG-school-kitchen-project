const { response } = require('express');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/usuario');
const { generarJWT } = require('../helpers/jwt');
const jwt = require('jsonwebtoken');

const token = async(req, res = response) => {

    const token = req.headers['x-token'];

    try {
        const { uid, rol, ...object } = jwt.verify(token, process.env.JWTSECRET);

        const userBD = await Usuario.findById(uid);
        if (!userBD) {
            return res.status(400).json({
                ok: false,
                msg: 'Token no válido',
                token: ''
            });
        }
        const rolBD = userBD.rol;

        const new_token = await generarJWT(uid, rol);
        
        res.json({
            ok: true,
            msg: 'Token',
            uid: uid,
            nombre: userBD.nombre,
            email: userBD.email,
            rol: rolBD,
            colegio: userBD.colegio,
            registerDate: userBD.registerDate,
            imagen: userBD.imagen,
            ciudad: userBD.ciudad,
            tipo_proveedor: userBD.tipo_proveedor,
            telefono: userBD.telefono,
            token: new_token
        });
    } catch {
        return res.status(400).json({
            ok: false,
            msg: 'Token no válido',
            token: ''
        });
    }
}


const login = async(req, res = response) => {

    const { email, password } = req.body;

    try {
        const userBD = await Usuario.findOne({ email });
        if (!userBD) {
            return res.status(400).json({
                ok: false,
                msg: 'Usuario o contraseña incorrecta',
                token: ''
            });
        }

        const validPassword = bcrypt.compareSync(password, userBD.password);
        if (!validPassword) {
            return res.status(400).json({
                ok: false,
                msg: 'Usuario o contraseña incorrecta',
                token: ''
            });
        }

        const { _id, rol, nombre, imagen } = userBD;
        const token = await generarJWT(userBD._id, userBD.rol);

        res.json({
            ok: true,
            msg: 'login',
            uid: _id,
            nombre,
            rol,
            imagen,
            token
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error haciendo login',
            token: ''
        });
    }

}

module.exports = { token, login }

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

const verifyLinkConfirmAcount = async(req, res) => {

    const id = req.query.id;
    const code = req.params.code;

    try {
        // Obtener el token
        if (!id) {
            return res.status(400).json({
                ok: false,
                msg: 'Ha habido un error de verificación de usuario'
            });
            //return res.redirect('');
        }

        if (!code) {
            return res.status(400).json({
                ok: false,
                msg: 'El código de activación de usuario es erróneo'
            });

        }
        // Verificar existencia del usuario
        const user = await Usuario.findById(id);

        if (!user) {
            return res.status(400).json({
                ok: false,
                msg: 'No se ha podido verificar el usuario'
            });
        }

        if (user._id != id) {
            return res.status(400).json({
                ok: false,
                msg: 'Usuario erróneo'
            });
        }

        if (user.code != code) {
            return res.status(400).json({
                ok: false,
                msg: 'Código de activación erroneo'
            });
        }
        // Redireccionar a la confirmación
        //return res.redirect('/');
        res.json({
            ok: true,
            msg: 'El enlace es correcto'
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'El link no es válido'
        });
    }
}

const cambiarContraseña = async(req, res = response) => {
    const uid = req.query.id;
    const code = req.params.code || '';
    const { password, repeatPwd } = req.body;
    console.log(uid);
    try {
        const usuario = await Usuario.findById(uid);
        console.log(usuario);
        //Si el usuario no existe no se puede cambiar la contraseña
        if (!usuario) {
            return res.status(400).json({
                ok: false,
                msg: 'Usuario incorrecto',
            });
        }

        if(code == ''){
            return res.status(400).json({
                ok: false,
                msg: 'El código de enlace no es válido',
            }); 
        }

        if(usuario.code != code){
            return res.status(400).json({
                ok: false,
                msg: 'El código de enlace no es válido',
            }); 
        }
        //Comprobamos que las dos contraseñas son iguales
        if (password !== repeatPwd) {
            return res.status(400).json({
                ok: false,
                msg: 'La primera contraseña es diferente de la segunda',
            });
        }

        // tenemos todo OK, ciframos la nueva contraseña y la actualizamos
        const salt = bcrypt.genSaltSync();
        const cpassword = bcrypt.hashSync(password, salt);
        usuario.password = cpassword;

        // Almacenar en BD
        await usuario.save();

        res.json({
            ok: true,
            msg: 'Password updated'
        });

    } catch (error) {
        return res.status(400).json({
            ok: false,
            msg: 'Error modificando la contraseña',
        });
    }
}

module.exports = { token, login, verifyLinkConfirmAcount, cambiarContraseña }

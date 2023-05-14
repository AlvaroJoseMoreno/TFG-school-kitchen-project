const { response } = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/usuario');
const Colegio = require('../models/Colegio');
const { infoToken } = require('../helpers/infoToken');
const { sendEmail } = require('../helpers/email_user');
const uniqid = require('uniqid'); 

const getUsuarios = async(req, res = response) => {
    const id = req.query.id
    const text = req.query.texto || '';
    const rol = req.query.rol || '';
    const colegio = req.query.colegio || '';
    let query = "{";
    let total = 0;
    try {
        const token = req.header('x-token');
        if (!infoToken(token)) {
            return res.status(400).json({
                ok: false,
                msg: 'No tienes permisos para realizar esta acción',
            });
        }

        let usuarios = [];
        if(id){
            [usuarios, total] = await Promise.all([Usuario.findById(id).populate('colegio', '-__v'),
                                Usuario.countDocuments({_id: id})
            ]);
        } else {
            if (rol != '') {
                let roll =  `"${rol}"`;
                query += `"rol":` + roll + ``;
            }
            if(colegio != ''){
                let col = `"${colegio}"`;
                if(rol != '') { query += ","};
                query += `"colegio":` + col +``;
            }
            if(text != ''){
                if(rol != '' || colegio != '') { query += "," };
                query += `"$or": [{"nombre": {"$regex": ".*${text}.*", "$options": "i"}},
                                  {"email": {"$regex": ".*${text}.*", "$options": "i"}}]`;
            }
            query += "}";
            const queryJSON = JSON.parse(query);
            [usuarios, total] = await Promise.all([Usuario.find(queryJSON).sort({ nombre: 1 })
                .populate('colegio', '-__v'),
                Usuario.countDocuments(queryJSON)
            ]);
        }
        
        res.json({
            ok: true,
            msg: 'Usuarios obtenidos con exito',
            usuarios,
            total
        })
        
    } catch (error) {
        console.log(error);
        res.json({
            ok: false,
            msg: 'Error obteniendo los usuarios'
        });
    }
}

const crearAdmin = async(req, res = response) => {

    const { email, nombre, rol } = req.body;

    try {
        const token = req.header('x-token');
        
        if (!((infoToken(token).rol === 'ROL_ADMIN'))) {
            return res.status(400).json({
                ok: false,
                msg: 'No tienes permisos para realizar esta acción',
            });
        }
        
        if (rol != 'ROL_ADMIN') {
            return res.status(400).json({
                ok: false,
                msg: 'No puedes crear un usuario que no sea un administrador',
            });
        }
        // Comrprobar que no existe un usuario con ese email registrado
        const exists_email = await Usuario.findOne({ email: email });

        if (exists_email) {
            return res.status(400).json({
                ok: false,
                msg: 'Este email no es válido, por favor, use otro'
            });
        }

        // Cifrar la contraseña, obtenemos el salt y ciframos
        // const salt = bcrypt.genSaltSync();
        // const cpassword = bcrypt.hashSync(password, salt);
        //Creamos nuevo usuario
        const usuario = new Usuario(req.body);
        //usuario.password = cpassword;
        // Almacenar en BD
        const unidq = uniqid();
        await sendEmail(usuario.email, usuario.nombre, unidq, usuario._id);
        usuario.code = unidq;
        await usuario.save();

        res.json({
            ok: true,
            msg: 'El usuario: ' + nombre + ' ha sido creado con éxito',
            usuario
            //token
        });

    } catch (error) {
        console.log(error);
        return res.status(401).json({
            ok: false,
            msg: 'Error creando el usuario'
        });
    }
}

const crearSuper = async(req, res = response) => {

    const { email, nombre, rol, colegio } = req.body;

    try {
        const token = req.header('x-token');
        // solo un administrador puede crear un usuario supervisor
        if (!((infoToken(token).rol === 'ROL_ADMIN'))) {
            return res.status(400).json({
                ok: false,
                msg: 'No tienes permisos para realizar esta acción',
            });
        }
        
        if (rol != 'ROL_SUPERVISOR') {
            return res.status(400).json({
                ok: false,
                msg: 'No se puede crear un usario que no sea un supervisor',
            });
        }

        const exist_colegio = await Colegio.findById(colegio);
        if(!exist_colegio){
            return res.status(400).json({
                ok: false,
                msg: 'No existe este colegio',
            });
        }
        // Comrprobar que no existe un usuario con ese email registrado
        const exists_email = await Usuario.findOne({ email: email });

        if (exists_email) {
            return res.status(400).json({
                ok: false,
                msg: 'Este email no es válido, por favor, use otro'
            });
        }

        // Cifrar la contraseña, obtenemos el salt y ciframos
        // const salt = bcrypt.genSaltSync();
        // const cpassword = bcrypt.hashSync(password, salt);
        //Creamos nuevo usuario
        const usuario = new Usuario(req.body);
        //usuario.password = cpassword;
        // Almacenar en BD
        const unidq = uniqid();
        await sendEmail(usuario.email, usuario.nombre, unidq, usuario._id);
        usuario.code = unidq;
        await usuario.save();

        res.json({
            ok: true,
            msg: 'El usuario: ' + nombre + ' ha sido creado con éxito',
            usuario
            //token
        });

    } catch (error) {
        console.log(error);
        return res.status(401).json({
            ok: false,
            msg: 'Error creando el usuario'
        });
    }
}

const crearProveedor = async(req, res = response) => {

    const { email, nombre, rol, colegio } = req.body;

    try {
        const token = req.header('x-token');
        // solo un administrador puede crear un usuario supervisor
        if (infoToken(token).rol !== 'ROL_ADMIN' && infoToken(token).rol !== 'ROL_SUPERVISOR') {
            return res.status(400).json({
                ok: false,
                msg: 'No tienes permisos para realizar esta acción',
            });
        }
        
        if (rol != 'ROL_PROVEEDOR') {
            return res.status(400).json({
                ok: false,
                msg: 'No se puede crear un usario que no sea un proveedor',
            });
        }

        const exist_colegio = await Colegio.findById(colegio);
        if(!exist_colegio){
            return res.status(400).json({
                ok: false,
                msg: 'No existe este colegio',
            });
        }
        // Comrprobar que no existe un usuario con ese email registrado
        const exists_email = await Usuario.findOne({ email: email });

        if (exists_email) {
            return res.status(400).json({
                ok: false,
                msg: 'Este email no es válido, por favor, use otro'
            });
        }

        // Cifrar la contraseña, obtenemos el salt y ciframos
        // const salt = bcrypt.genSaltSync();
        // const cpassword = bcrypt.hashSync(password, salt);
        //Creamos nuevo usuario
        const usuario = new Usuario(req.body);
        //usuario.password = cpassword;
        // Almacenar en BD
        const unidq = uniqid();
        await sendEmail(usuario.email, usuario.nombre, unidq, usuario._id);
        usuario.code = unidq;
        await usuario.save();

        res.json({
            ok: true,
            msg: 'El proveedor: ' + nombre + ' ha sido creado con éxito',
            usuario
            //token
        });

    } catch (error) {
        console.log(error);
        return res.status(401).json({
            ok: false,
            msg: 'Error creando el usuario'
        });
    }
}

const crearCocinero = async(req, res = response) => {

    const { email, nombre, rol, colegio } = req.body;
    try {
        const token = req.header('x-token');
        // solo un administrador puede crear un usuario supervisor
        if (infoToken(token).rol !== 'ROL_ADMIN' && infoToken(token).rol !== 'ROL_SUPERVISOR') {
            return res.status(400).json({
                ok: false,
                msg: 'No tienes permisos para realizar esta acción',
            });
        }
        
        if (rol != 'ROL_COCINERO') {
            return res.status(400).json({
                ok: false,
                msg: 'No se puede crear un usario que no sea un cocinero',
            });
        }

        const exist_colegio = await Colegio.findById(colegio);
        if(!exist_colegio){
            return res.status(400).json({
                ok: false,
                msg: 'No existe este colegio',
            });
        }
        // Comrprobar que no existe un usuario con ese email registrado
        const exists_email = await Usuario.findOne({ email: email });

        if (exists_email) {
            return res.status(400).json({
                ok: false,
                msg: 'Este email no es válido, por favor, use otro'
            });
        }

        // Cifrar la contraseña, obtenemos el salt y ciframos
        // const salt = bcrypt.genSaltSync();
        // const cpassword = bcrypt.hashSync(password, salt);
        //Creamos nuevo usuario
        const usuario = new Usuario(req.body);
        //usuario.password = cpassword;
        // Almacenar en BD
        const unidq = uniqid();
        await sendEmail(usuario.email, usuario.nombre, unidq, usuario._id);
        usuario.code = unidq;
        await usuario.save();

        res.json({
            ok: true,
            msg: 'El cocinero: ' + nombre + ' ha sido creado con éxito',
            usuario
            //token
        });

    } catch (error) {
        console.log(error);
        return res.status(401).json({
            ok: false,
            msg: 'Error creando el usuario'
        });
    }
}

const updateUsuario = async(req, res = response) => {
    const { email, nombre, rol, colegio, tipo_proveedor } = req.body;
    const id = req.params.id || '';
    try {
        const token = req.header('x-token');
        
        const exist_user = await Usuario.findById(id);
        if(!exist_user){
            return res.status(400).json({
                ok: false,
                msg: 'Usuario erróneo',
            });
        }
        // solo puede modificar un usuario un admin o si el usuario que esta 
        // haciendo la modificacion tiene un token propio
        if(infoToken(token).rol !== 'ROL_ADMIN' && infoToken(token).uid !== id){
            return res.status(400).json({
                ok: false,
                msg: 'No puedes modificar este usuario',
            });
        }

        const exist_colegio = await Colegio.findById(colegio);
        if(!exist_colegio){
            return res.status(400).json({
                ok: false,
                msg: 'No existe este colegio',
            });
        }
        // Comrprobar que no existe un usuario con ese email registrado
        const exists_email = await Usuario.findOne({ email: email });
        // si existe este usuario hay que comprobar que sea el mismo que el que esta 
        // realizando la petición
        console.log(exists_email);
        if (exists_email && exists_email._id.toString() != exist_user._id.toString()) {
            return res.status(400).json({
                ok: false,
                msg: 'Este email no es válido, por favor, use otro'
            });
        }
        // el único usuario que puede modificar roles es el admin
        if (infoToken(token).rol !== 'ROL_ADMIN' && rol != exist_user.rol) {
            return res.status(400).json({
                ok: false,
                msg: 'No tienes permisos para modificar tu rol',
            });
        }
        // solo los proveedores pueden tener ese campo
        if(rol !== 'ROL_PROVEEDOR' && tipo_proveedor){
            return res.status(400).json({
                ok: false,
                msg: 'Solo los proveedores pueden tener este campo',
            });
        }
        // solo los administradores pueden cambiar de colegio a un usuario
        if(infoToken(token).rol !== 'ROL_ADMIN' && colegio != exist_user.colegio){
            return res.status(400).json({
                ok: false,
                msg: 'No tienes permisos para modificar tu colegio',
            });
        }

        const object = {
            email: email,
            nombre: nombre,
            rol: rol,
            tipo_proveedor: tipo_proveedor,
            colegio: colegio,
            ciudad: req.body.ciudad,
            telefono: req.body.telefono
        }
        // Cifrar la contraseña, obtenemos el salt y ciframos
        const usuario = await Usuario.findByIdAndUpdate(id, object, { new: true });

        res.json({
            ok: true,
            msg: 'El usuario: ' + nombre + ' ha sido modificado con éxito',
            usuario
        });

    } catch (error) {
        console.log(error);
        return res.status(401).json({
            ok: false,
            msg: 'Error modificando el usuario'
        });
    }
}

const borrarUsuario = async(req, res = response) => {
    const id = req.params.id;

    try {
        const token = req.header('x-token');
        // solo un administrador puede crear un usuario supervisor
        if (infoToken(token).rol !== 'ROL_ADMIN' && infoToken(token).rol !== 'ROL_SUPERVISOR') {
            return res.status(400).json({
                ok: false,
                msg: 'No tienes permisos para realizar esta acción',
            });
        }
        //comprobamos que el usuario que se quiere eliminar existe
        const user = await Usuario.findById(id);
        if(!user){
            return res.status(400).json({
                ok: false,
                msg: 'Identificador de usuario inválido',
            });
        }
        // si el usuario es un supervisor, tiene que pertenecer al mismo colegio
        // que el usuario al que pretende eliminar
        if(infoToken(token).rol === 'ROL_SUPERVISOR'){
            const supervisor = await Usuario.findById(infoToken(token).uid);
            if((!supervisor || user.colegio.toString() != supervisor.colegio.toString()) 
                && (user.rol !== 'ROL_SUPERVISOR' && user.rol !== 'ROL_ADMIN')){
                return res.status(400).json({
                    ok: false,
                    msg: 'No tienes permisos para realizar esta acción',
                });
            }
        }

        // eliminar el usuario
        const deleted_user = await Usuario.findByIdAndRemove(id);

        res.json({
            ok: true,
            msg: 'El usuario: ' + deleted_user.nombre + ' ha sido eliminado con éxito',
            deleted_user
        });

    } catch (error) {
        console.log(error);
        return res.status(401).json({
            ok: false,
            msg: 'Error eliminando el usuario'
        });
    }
}

module.exports = { getUsuarios, crearAdmin, crearSuper, crearProveedor, crearCocinero, updateUsuario, borrarUsuario }
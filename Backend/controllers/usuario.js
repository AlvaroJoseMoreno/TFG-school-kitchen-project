const { response } = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/usuario');
const { infoToken } = require('../helpers/infoToken');

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

    const { email, password, nombre, rol } = req.body;

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
        const salt = bcrypt.genSaltSync();
        const cpassword = bcrypt.hashSync(password, salt);
        //Creamos nuevo usuario
        const usuario = new Usuario(req.body);
        usuario.password = cpassword;
        // Almacenar en BD
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

module.exports = { getUsuarios, crearAdmin }
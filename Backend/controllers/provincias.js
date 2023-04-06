const { response } = require('express');
const mongoose = require('mongoose');
const Provincia = require('../models/provincias');
const { infoToken } = require('../helpers/infoToken');

const getProvincias = async(req, res = response) => {
    const id = req.query.id;
    const name = req.query.nombre;
    let query = {};

    try {

        const token = req.header('x-token');
        if ((infoToken(token).rol !== 'ROL_ADMIN')) {
            return res.status(400).json({
                ok: false,
                msg: 'No tienes permisos para realizar esta acción',
            });
        }

        let provincias = [];

        if (id) {
            [provincias, total] = await Promise.all([Provincia.findById(id),
                Provincia.countDocuments({_id: id})
            ]);
        } else if (name) {
            query = { nombre: { $regex: ".*" + name + ".*", $options: 'i' } };

            [provincias, total] = await Promise.all([Provincia.find(query),
                Provincia.countDocuments(query)
            ]);
        } else {
            [provincias, total] = await Promise.all([Provincia.find({}).sort({ nombre: 1 }),
                Provincia.countDocuments()
            ]);
        }

        res.json({
            ok: true,
            message: 'Aquí están las provincias',
            provincias,
            total
        });
    } catch (error) {
        console.log(error);
        res.json({
            ok: false,
            msg: 'Error obteniendo las provincias'
        });
    }
}

const getProvinciasPorColegio = async(req, res = response) => {
    try {

        const token = req.header('x-token');
        if ((infoToken(token).rol !== 'ROL_ADMIN')) {
            return res.status(400).json({
                ok: false,
                msg: 'No tienes permisos para realizar esta acción',
            });
        }

        const provincias = await Provincia.find({}, {"codigo": 0}).sort({num_colegios: -1}).limit(5);

        res.json({
            ok: true,
            message: 'Aquí están las provincias',
            provincias
        });
    } catch (error) {
        console.log(error);
        res.json({
            ok: false,
            msg: 'Error obteniendo las provincias'
        });
    }
}

const crearProvincia = async(req, res = response) => {
    const { nombre, codigo } = req.body;

    try {
        const token = req.header('x-token');
        if (infoToken(token).rol !== 'ROL_ADMIN') {
            return res.status(400).json({
                ok: false,
                msg: 'No tienes permisos para realizar esta acción',
            });
        }
        // Comrprobar que no existe una provincia con ese nombre
        const exists_province = await Provincia.findOne({ nombre: nombre, codigo: codigo });

        if (exists_province) {
            return res.status(400).json({
                ok: false,
                msg: 'La provincia ya existe, no pueden haber dos iguales'
            });
        }
        //Creamos nuevo provincia
        const provincia = new Provincia(req.body);
        // Almacenar en BD
        await provincia.save();

        res.json({
            ok: true,
            msg: 'La provincia: ' + nombre + ' ha sido creada con éxito',
            provincia,
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error creando la provincia'
        });
    }
} 

const updateProvincia = async(req, res = response) => {
    const { nombre, codigo } = req.body;
    const id = req.params.id || '';

    try {
        const token = req.header('x-token');
        if (infoToken(token).rol !== 'ROL_ADMIN') {
            return res.status(400).json({
                ok: false,
                msg: 'No tienes permisos para realizar esta acción',
            });
        }
        //comprobar identificador de provincia
        const exists_prov = await Provincia.findById(id);

        if (!exists_prov) {
            return res.status(400).json({
                ok: false,
                msg: 'El identificador de provincia no es válido'
            });
        }
        // Comrprobar que no existe una provincia con ese nombre
        const exists_province = await Provincia.findOne({ nombre: nombre, codigo: codigo });

        if (exists_province) {
            return res.status(400).json({
                ok: false,
                msg: 'La provincia ya existe, no pueden haber dos iguales'
            });
        }

        const objeto = { nombre: nombre, codigo: codigo }
        // Modificamos el objeto en base de datos
        const provincia = await Provincia.findByIdAndUpdate(id, objeto, { new: true })

        res.json({
            ok: true,
            msg: 'La provincia: ' + nombre + ' ha sido modificada con éxito',
            provincia,
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error modificando la provincia'
        });
    }
}

const borrarProvincia = async(req, res = response) => {

    const id = req.params.id || '';

    try {
        const token = req.header('x-token');
        if (infoToken(token).rol !== 'ROL_ADMIN') {
            return res.status(400).json({
                ok: false,
                msg: 'No tienes permisos para realizar esta acción',
            });
        }
        //comprobar identificador de provincia
        const exists_prov = await Provincia.findById(id);

        if (!exists_prov) {
            return res.status(400).json({
                ok: false,
                msg: 'El identificador de provincia no es válido'
            });
        }
        // Modificamos el objeto en base de datos
        const provincia = await Provincia.findByIdAndRemove(id);

        res.json({
            ok: true,
            msg: 'La provincia: ' + provincia.nombre + ' ha sido eliminando con éxito',
            provincia,
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error eliminando la provincia'
        });
    }

}

module.exports = { getProvincias, getProvinciasPorColegio, crearProvincia, updateProvincia, borrarProvincia }
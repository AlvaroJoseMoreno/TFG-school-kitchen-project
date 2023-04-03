const { response } = require('express');
const mongoose = require('mongoose');
const Provincia = require('../models/provincias');
const Colegio = require('../models/Colegio');
const { infoToken } = require('../helpers/infoToken');

const getColegios = async(req, res = response) => {
    
    const id = req.query.id;
    const nombre = req.query.nombre || '';
    const provincia = req.query.provincia || ''; 
    let query = {};
    let texto = '';
    let total = 0;
    try {
        const token = req.header('x-token');

        if ((infoToken(token).rol !== 'ROL_ADMIN')) {
            return res.status(400).json({
                ok: false,
                msg: 'No tienes permisos para realizar esta acción',
            });
        }

        let colegios = [];

        if (id) {
            colegios = await Colegio.findById(id);
            total = colegios.length; 
        } else if (nombre != '') {
            texto = new RegExp(nombre, 'i');
            if(provincia != ''){
                query = { provincia: provincia, $or: [{ nombre: texto }] }
            } else {
                query = { $or: [{ nombre: texto }] }
            }
        } else {
            if(provincia != ''){
                query = { provincia: provincia }
            }
        }

        [colegios, total] = await Promise.all([Colegio.find(query).sort({ nombre: 1 }).populate('provincia', '-__v'),
            Colegio.countDocuments(query)
        ]);

        res.json({
            ok: true,
            message: 'Aquí están los colegios',
            colegios,
            total
        });
    } catch (error) {
        console.log(error);
        res.json({
            ok: false,
            msg: 'Error obteniendo los colegios'
        });
    }
}

const crearColegio = async(req, res = response) => {
    const { nombre, provincia } = req.body;

    try {
        const token = req.header('x-token');
        if (infoToken(token).rol !== 'ROL_ADMIN') {
            return res.status(400).json({
                ok: false,
                msg: 'No tienes permisos para realizar esta acción',
            });
        }
        // Comrprobar que no existe una provincia con el identificador
        const exist_provincia = await Provincia.findById(provincia);

        if(!exist_provincia){
            return res.status(400).json({
                ok: false,
                msg: 'La provincia no es válida',
            });
        }
        exist_provincia.num_colegios += 1;
        await exist_provincia.save();
        
        //Creamos nuevo provincia
        const colegio = new Colegio(req.body);
        // Almacenar en BD
        await colegio.save();

        res.json({
            ok: true,
            msg: 'El colegio: ' + nombre + ' ha sido creado con éxito',
            colegio,
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error creando la provincia'
        });
    }
} 

//queda por hacer esto y el get provinces by num colegios

const updateColegio = async(req, res = response) => {
    const { nombre, provincia } = req.body;
    const id = req.params.id || '';

    try {
        const token = req.header('x-token');
        if (infoToken(token).rol !== 'ROL_ADMIN') {
            return res.status(400).json({
                ok: false,
                msg: 'No tienes permisos para realizar esta acción',
            });
        }
        //comprobar identificador de colegio
        const exists_col = await Colegio.findById(id);

        if (!exists_col) {
            return res.status(400).json({
                ok: false,
                msg: 'El identificador de colegio no es válido'
            });
        }
        // Comrprobar que la provincia que llega en el cuerpo existe.
        const exist_provincia = await Provincia.findById(provincia);

        if(!exist_provincia){
            return res.status(400).json({
                ok: false,
                msg: 'La provincia no es válida',
            });
        }

        const exist_prov_colegio = await Provincia.findById(exists_col.provincia);
        // comprobamos que la provincia que está asociada actualmente al colegio existe
        // si existe y la nueva provincia y la anterior son distintas, se incrementa y decrementan
        // el numero de provincias por colegio
        // si no existe la antigua provincia, se le incrementa a la nueva provincia un colegio
        if(exist_prov_colegio && exist_prov_colegio._id.toString() != exist_provincia._id.toString()){
            exist_provincia.num_colegios += 1;
            exist_prov_colegio.num_colegios -= 1;
        } else if (!exist_prov_colegio){
            exist_provincia.num_colegios += 1;
        }   

        // Modificamos el objeto en base de datos
        const colegio = await Colegio.findByIdAndUpdate(id, req.body, { new: true })
        //guardamos los cambios de las provincias en la base de datos
        await exist_provincia.save();
        await exist_prov_colegio.save();

        res.json({
            ok: true,
            msg: 'El colegio: ' + colegio.nombre + ' ha sido modificada con éxito',
            colegio,
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error modificando la provincia'
        });
    }
}

const borrarColegio = async(req, res = response) => {

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
        const exists_col = await Colegio.findById(id);

        if (!exists_col) {
            return res.status(400).json({
                ok: false,
                msg: 'El identificador del colegio no es válido'
            });
        }

        const exist_prov = await Provincia.findById(exists_col.provincia);

        if(exist_prov){
            exist_prov.num_colegios -= 1;
            await exist_prov.save();
        }
        
        // Modificamos el objeto en base de datos
        const colegio = await Colegio.findByIdAndRemove(id);

        res.json({
            ok: true,
            msg: 'El colegio: ' + colegio.nombre + ' ha sido eliminando con éxito',
            colegio,
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error eliminando el colegio'
        });
    }

}

module.exports = { getColegios, crearColegio, updateColegio, borrarColegio }
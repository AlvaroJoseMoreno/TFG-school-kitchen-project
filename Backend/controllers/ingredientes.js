const { response } = require('express');
const mongoose = require('mongoose');
const Comensal = require('../models/comensales');
const Ingrediente = require('../models/ingrediente');
const Usuario = require('../models/usuario');
const { infoToken } = require('../helpers/infoToken');

const getIngredientes = async(req, res = response) => {
    
    const id = req.query.id;
    const text = req.query.texto || '';
    const proveedor = req.query.proveedor || '';
    // ya veremos si lo metemos
    const alergenos = req.query.alergenos || ''; 
    let query = {};
    let texto = '';
    let total = 0;
    try {
        const token = req.header('x-token');

        if (!(infoToken(token))) {
            return res.status(400).json({
                ok: false,
                msg: 'No tienes permisos para realizar esta acción',
            });
        }

        let ingredientes = [];

        if (id) {
            [ingredientes, total] = await Promise.all([Ingrediente.findById(id),
                Ingrediente.countDocuments({_id: id}),
            ]);
        } else{
            if(text != '') {
                texto = new RegExp(text, 'i');
                if(proveedor != ''){
                    query = { proveedor: proveedor, $or: [{ nombre: texto }]  }
                } else {
                    query = { $or: [{ nombre: texto }] }
                }
            } else {
                if(proveedor != ''){
                    query = { proveedor: proveedor }
                }
            }
            [ingredientes, total] = await Promise.all([Ingrediente.find(query).sort({ date: 1 })
                .populate('proveedor', '-__v -password'),
                Ingrediente.countDocuments(query)
            ]);
        }

        res.json({
            ok: true,
            message: 'Aquí están los ingredientes',
            ingredientes,
            total
        });
    } catch (error) {
        console.log(error);
        res.json({
            ok: false,
            msg: 'Error obteniendo los ingredientes'
        });
    }
}

const crearIngredientes = async(req, res = response) => {
    const { proveedor, nombre } = req.body;

    try {
        const token = req.header('x-token');

        if (infoToken(token).rol !== 'ROL_ADMIN' && infoToken(token).rol !== 'ROL_PROVEEDOR') {
            return res.status(400).json({
                ok: false,
                msg: 'No tienes permisos para realizar esta acción',
            });
        }

        const exist_ing = await Ingrediente.findOne({ nombre: nombre, proveedor: proveedor });
        if(exist_ing){
            return res.status(400).json({
                ok: false,
                msg: 'Ya tienes este ingrediente en la base de datos',
            });
        }

        // Comprobar que existe el proveedor que crea el ingrediente
        const exist_user = await Usuario.findById(proveedor);
        if(!exist_user){
            return res.status(400).json({
                ok: false,
                msg: 'El usuario que crea el ingrediente no es valido',
            });
        }

        if(infoToken(token).rol === 'ROL_PROVEEDOR'){
            if(infoToken(token).uid.toString() != exist_user._id.toString()){
                return res.status(400).json({
                    ok: false,
                    msg: 'No tienes permisos para realizar esta acción',
                });
            }
        }

        //Creamos nuevo provincia
        const ingrediente = new Ingrediente(req.body);
        // Almacenar en BD
        await ingrediente.save();

        res.json({
            ok: true,
            msg: 'El ingrediente: ' + ingrediente.nombre + ' ha sido registrado con éxito',
            ingrediente,
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error creando los ingredientes'
        });
    }
} 

//queda por hacer esto y el get provinces by num colegios

const updateIngredientes = async(req, res = response) => {
    const { proveedor, nombre } = req.body;
    const id = req.params.id || '';

    try {
        const token = req.header('x-token');
        //solo pueden modificar un registro de comensales esos roles
        if (infoToken(token).rol !== 'ROL_ADMIN' && infoToken(token).rol !== 'ROL_PROVEEDOR') {
            return res.status(400).json({
                ok: false,
                msg: 'No tienes permisos para realizar esta acción',
            });
        }
        const exist_ing_id = await Ingrediente.findById(id);
        if(!exist_ing_id){
            return res.status(400).json({
                ok: false,
                msg: 'No existe este ingrediente',
            });
        }
        //comprobamos que el usuario que se pasa por parámetro ya existe
        const exist_prov = await Usuario.findById(proveedor);
        if(!exist_prov){
            return res.status(400).json({
                ok: false,
                msg: 'No existe este proveedor',
            }); 
        }
        // comprobamos que no existe el proveedor no tiene ese ingrediente registrado 
        // y si lo tiene registrado que el id sea distinto del que queremos modificar
        const exist_ing = await Ingrediente.findOne({ nombre: nombre, proveedor: proveedor });
        if(exist_ing && exist_ing._id.toString() != exist_ing_id._id.toString()){
            return res.status(400).json({
                ok: false,
                msg: 'Ya tienes este ingrediente en la base de datos',
            });
        }
        // comprobamos que si el usuario es proveedor, el id del token y el id del proveedor es el mismo,   
        // si no no se puede modificar el ingrediente
        if(infoToken(token).rol === 'ROL_PROVEEDOR'){
            if(infoToken(token).uid.toString() != exist_prov._id.toString()){
                return res.status(400).json({
                    ok: false,
                    msg: 'No tienes permisos para realizar esta acción',
                });
            }
        }

        const ingrediente = await Ingrediente.findByIdAndUpdate(id, req.body, { new: true })

        res.json({
            ok: true,
            msg: 'El ingrediente ' + ingrediente.nombre + ' ha sido modificada con éxito',
            ingrediente
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error modificando el ingrediente'
        });
    }
}

const borrarIngredientes = async(req, res = response) => {

    const id = req.params.id || '';

    try {
        const token = req.header('x-token');
        // comprobamos que no se
        if ((infoToken(token).rol !== 'ROL_ADMIN' && infoToken(token).rol !== 'ROL_PROVEEDOR')) {
            return res.status(400).json({
                ok: false,
                msg: 'No tienes permisos para realizar esta acción',
            });
        }
        
        const exist_ingrediente = await Ingrediente.findById(id);
        if (!exist_ingrediente) {
            return res.status(400).json({
                ok: false,
                msg: 'El identificador del ingrediente no es válido'
            });
        }
        // comprobamos que el usuario que va a borrar sea o un admin o bien del mismo colegio
        // que tiene asignado el usuario
        if(infoToken(token).rol === 'ROL_PROVEEDOR'){
            if(infoToken(token).uid.toString() != exist_ingrediente.proveedor.toString()){
                return res.status(400).json({
                    ok: false,
                    msg: 'Tu usuario no tiene permisos para realizar esta acción',
                });
            }
        }
        //aqui comprobaremos el array de ingredientes en los pedidos y eliminaremos este
        //ingrediente de cada pedido en el que se encuentre.
    
        // Modificamos el objeto en base de datos
        const ingrediente = await Ingrediente.findByIdAndRemove(id);

        res.json({
            ok: true,
            msg: 'El ingrediente ' + ingrediente.nombre + ' ha sido eliminando con éxito',
            ingrediente,
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error eliminando el ingrediente'
        });
    }

}

module.exports = { getIngredientes, crearIngredientes, updateIngredientes, borrarIngredientes }
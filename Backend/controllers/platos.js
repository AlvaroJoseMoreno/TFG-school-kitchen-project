const { response } = require('express');
const mongoose = require('mongoose');
const Plato = require('../models/plato');
const Ingrediente = require('../models/ingrediente');
const Usuario = require('../models/usuario');
const Colegio = require('../models/Colegio');
const { infoToken } = require('../helpers/infoToken');

// estado puede ser 'Pendiente', 'Parcialmente Completado', 'Entregado'

const getPlatos = async(req, res = response) => {
    
    const id = req.query.id;
    const text = req.query.texto || '';
    const ingrediente = req.query.ingrediente || '';
    const colegio = req.query.colegio || '';

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

        let platos = [];

        if (id) {
            [platos, total] = await Promise.all([Plato.findById(id),
                Plato.countDocuments({_id: id}),
            ]);
        } else{
            if(text != ''){
                texto = new RegExp(text, 'i');
                if(ingrediente != ''){
                        if(colegio != '') {
                            query = { ingredientes: ingrediente, $or: [{ nombre: texto }, { receta: texto }], colegio: colegio };
                        } else {
                            query = { ingredientes: ingrediente, $or: [{ nombre: texto }, { receta: texto }] };
                        }
                } else {
                    if(colegio != ''){
                        query = { $or: [{ nombre: texto }, { receta: texto }], colegio: colegio };
                    } else {
                        query = { $or: [{ nombre: texto }, { receta: texto }] };
                    }
                }
            } else {
                if(ingrediente != ''){
                    if(colegio != ''){
                        query = { ingredientes: ingrediente, colegio: colegio };  
                    } else {
                        query = { ingredientes: ingrediente };
                    }
                } else if(colegio != '') {
                    query = { colegio: colegio };
                }
            }
            [platos, total] = await Promise.all([Plato.find(query).sort({ nombre: 1 })
                .populate('colegio', '-__v').populate('ingredientes', '-__v'),
                Plato.countDocuments(query)
            ]);
        }
        res.json({
            ok: true,
            message: 'Aquí están los platos',
            platos,
            total
        });
    } catch (error) {
        console.log(error);
        res.json({
            ok: false,
            msg: 'Error obteniendo los platos'
        });
    }
}

const crearPlato = async(req, res = response) => {
    const { nombre, categoria, colegio, ingredientes, cantidad_ingredientes } = req.body;

    try {
        const token = req.header('x-token');
        // solo usuarios con estos roles pueden realizar esta acción
        if (infoToken(token).rol !== 'ROL_ADMIN' && infoToken(token).rol !== 'ROL_SUPERVISOR') {
            return res.status(400).json({
                ok: false,
                msg: 'No tienes permisos para realizar esta acción',
            });
        }
        // comprobamos que el plato no exista en la base de datos
        const exist_plato = await Plato.find({colegio: colegio, nombre: nombre});
        if(exist_plato.length > 0){
            return res.status(400).json({
                ok: false,
                msg: 'Este plato ya existe en tu colegio',
            });
        }       
        // los ingredientes y sus cantidades deben tener la misma longitud
        if(ingredientes.length != cantidad_ingredientes.length){
            return res.status(400).json({
                ok: false,
                msg: 'Los ingredientes tienen que tener la misma longitud que la cantidad',
            });
        }
        // comprobamos que no se repita ningun ingrediente
        const isRepeat = new Set(ingredientes).size !== ingredientes.length;
        if(isRepeat){
            return res.status(400).json({
                ok: false,
                msg: 'No se puede repetir ningún ingrediente',
            });
        }
        // Comprobar que existe el usuario de la base de datos que se pasa
        // como token
        const exist_user = await Usuario.findById(infoToken(token).uid);
        // comprobamos que el usuario sea válido y el rol del token de usuario sea el mismo
        // que el del usuario al que pertenezca el identificador pasado por token o
        if(!exist_user || (exist_user.rol !== 'ROL_ADMIN' && exist_user.rol !== infoToken(token).rol)){
            return res.status(400).json({
                ok: false,
                msg: 'Tu usuario no tiene permisos para realizar esta acción',
            });
        }
        // comprobamos que el colegio existe y si el usuario que crea el plato pertenece a ese 
        // colegio o si es un administrador
        const exist_colegio = await Colegio.findById(colegio);
        if(!exist_colegio || (exist_user.rol !== 'ROL_ADMIN' && exist_colegio._id.toString() != exist_user.colegio.toString())){
            return res.status(400).json({
                ok: false,
                msg: 'El colegio no es válido',
            });
        }
        // ahora tenemos que comprobar que el proveedor y el usuario tengan el mismo colegio
        // y que ese colegio exista

        // comprobamos que todos los identificadores que se pasan al array de ingredientes
        // sean realmente identificadores de ingredientes válidos dentro de la base de datos
        // tambien se comprueba que estos ingredientes esten asociados a un colegio con un
        // proveedor que provea materias a ese colegio
        for (let i = 0; i < ingredientes.length; i++){
            let ing = await Ingrediente.findById(ingredientes[i]).populate('proveedor');
            if(!ing){
                return res.status(400).json({
                    ok: false,
                    msg: 'Hay algún ingrediente que no es válido',
                });
            }
            if(ing.proveedor.colegio.toString() != colegio.toString()){
                return res.status(400).json({
                    ok: false,
                    msg: 'El ingregiente: ' + ing.nombre + ' no pertenece a este proveedor',
                });
            }
        }
        // calculamos el precio del plato
        let coste = 0;
        for (let i = 0; i < ingredientes.length; i++){
            let ing = await Ingrediente.findById(ingredientes[i]);
            coste += (cantidad_ingredientes[i] * ing.precio);
        }

        const object = {
            nombre: nombre,
            receta: req.body.receta,
            categoria: categoria,
            ingredientes: ingredientes,
            cantidad_ingredientes: cantidad_ingredientes,
            colegio: colegio,
            coste_racion: coste,
        }
        //Creamos nuevo plato
        const plato = new Plato(object);
        // Almacenar en BD
        await plato.save();

        res.json({
            ok: true,
            msg: 'El plato: ' + plato.nombre + ' ha sido registrado con éxito',
            plato
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error creando el plato'
        });
    }
}

const updatePlato = async(req, res = response) => {
    const { nombre, categoria, ingredientes, cantidad_ingredientes } = req.body;
    const id = req.params.id || '';

    try {
        const token = req.header('x-token');
        // solo usuarios con estos roles pueden realizar esta acción
        if (infoToken(token).rol !== 'ROL_ADMIN' && infoToken(token).rol !== 'ROL_SUPERVISOR') {
            return res.status(400).json({
                ok: false,
                msg: 'No tienes permisos para realizar esta acción',
            });
        }

        if(ingredientes.length != cantidad_ingredientes.length){
            return res.status(400).json({
                ok: false,
                msg: 'Los ingredientes tienen que tener la misma longitud que la cantidad',
            });
        }

        const isRepeat = new Set(ingredientes).size !== ingredientes.length;
        if(isRepeat){
            return res.status(400).json({
                ok: false,
                msg: 'No se puede repetir ningún ingrediente',
            });
        }
        // comprobamos la existencia del plato
        const exist_plato = await Plato.findById(id);
        if(!exist_plato){
            return res.status(400).json({
                ok: false,
                msg: 'No existe este plato',
            });
        }
        // hacemos con los ingredientes lo mismo que en el POST de la api
        for (let i = 0; i < ingredientes.length; i++){
            let ing = await Ingrediente.findById(ingredientes[i]).populate('proveedor');
            if(!ing){
                return res.status(400).json({
                    ok: false,
                    msg: 'Hay algún ingrediente que no es válido',
                });
            }
            if(ing.proveedor.colegio.toString() != exist_plato.colegio.toString()){
                return res.status(400).json({
                    ok: false,
                    msg: 'El ingrediente: '+ ing.nombre +' no pertenece a este colegio',
                });
            }
        }

        const usuario = await Usuario.findById(infoToken(token).uid);
        if(!usuario){
            return res.status(400).json({
                ok: false,
                msg: 'Este token no es válido',
            });
        }

        if(infoToken(token).rol !== 'ROL_ADMIN') {
            if (exist_plato.colegio.toString() != usuario.colegio.toString()){
                return res.status(400).json({
                    ok: false,
                    msg: 'Tu usuario no tiene permisos para realizar esta acción',
                });
            }
        }

        let coste = 0;
        for (let i = 0; i < ingredientes.length; i++){
            let ing = await Ingrediente.findById(ingredientes[i]);
            coste += (cantidad_ingredientes[i] * ing.precio);
        }

        const object = {
            nombre: nombre,
            receta: req.body.receta,
            categoria: categoria,
            ingredientes: ingredientes,
            cantidad_ingredientes: cantidad_ingredientes,
            coste_racion: coste,
        }

        const plato = await Plato.findByIdAndUpdate(id, object, { new: true })

        res.json({
            ok: true,
            msg: 'El plato ' + plato.nombre + ' ha sido modificado con éxito',
            plato
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error modificando el plato'
        });
    }
}

// recepcionar pedidos

const borrarPlato = async(req, res = response) => {
    const id = req.params.id || '';

    try {
        const token = req.header('x-token');
        // comprobamos el usuario que elimina el plato sea solo administrador o supervisor
        if (infoToken(token).rol !== 'ROL_ADMIN' && infoToken(token).rol !== 'ROL_SUPERVISOR') {
            return res.status(400).json({
                ok: false,
                msg: 'No tienes permisos para realizar esta acción',
            });
        }
        // comprobamos la existencia del plato
        const exist_plato = await Plato.findById(id);
        if (!exist_plato) {
            return res.status(400).json({
                ok: false,
                msg: 'El identificador del plato no es válido'
            });
        }
        // tenemos que comprobar que el plato pertenezca al colegio del supervisor que lo quiere eliminar
        if(infoToken(token).rol !== 'ROL_ADMIN'){
            const exist_user = await Usuario.findById(infoToken(token).uid);
            if(!exist_user){
                return res.status(400).json({
                    ok: false,
                    msg: 'Usuario no válido'
                });
            }
            if(exist_user.colegio.toString() !== exist_plato.colegio.toString()){
                return res.status(400).json({
                    ok: false,
                    msg: 'Este plato no pertenece a tu colegio'
                });
            }
        }
        const plato = await Plato.findByIdAndRemove(id);

        res.json({
            ok: true,
            msg: 'El plato: ' + plato.nombre + ' ha sido eliminando con éxito',
            plato,
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error eliminando el plato'
        });
    }

}

module.exports = { getPlatos, crearPlato, updatePlato, borrarPlato }
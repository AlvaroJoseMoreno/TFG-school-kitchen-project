const { response } = require('express');
const mongoose = require('mongoose');
const Pedido = require('../models/pedido');
const Ingrediente = require('../models/ingrediente');
const Usuario = require('../models/usuario');
const Colegio = require('../models/Colegio');
const { infoToken } = require('../helpers/infoToken');

// estado puede ser 'Pendiente', 'Parcialmente Completado', 'Entregado'

const getPedidos = async(req, res = response) => {
    
    const id = req.query.id;
    const text = req.query.texto || '';
    const proveedor = req.query.proveedor || '';
    const colegio = req.query.colegio || '';
    const status = req.query.estado || '';
    const visto = req.query.visto_por || ''
    let query = "{";
    let total = 0;
    try {
        const token = req.header('x-token');

        if (!(infoToken(token))) {
            return res.status(400).json({
                ok: false,
                msg: 'No tienes permisos para realizar esta acción',
            });
        }

        let pedidos = [];

        if (id) {
            [pedidos, total] = await Promise.all([Pedido.findById(id).populate('proveedor', '-__v -password').populate('colegio', '-__v')
            .populate('ingredientes', '-__v'),
                Pedido.countDocuments({_id: id}),
            ]);
            if(infoToken(token).uid === pedidos.proveedor._id.toString()){
                pedidos.visto_por = true;
                await pedidos.save();
            }
        } else{
            // vamos a hacerlo como los usuarios
            if (proveedor != '') {
                let prov =  `"${proveedor}"`;
                query += `"proveedor":` + prov + ``;
            }
            if(colegio != ''){
                let col = `"${colegio}"`;
                if(proveedor != '') { query += ","};
                query += `"colegio":` + col +``;
            }
            if(status != ''){
                let stat = `"${status}"`;
                if(proveedor != '' || colegio != '') { query += ","};
                query += `"estado":` + stat +``;
            }
            if(text != ''){
                if(proveedor != '' || colegio != '' || status != '') { query += "," };
                query += `"$or": [{"nombre": {"$regex": ".*${text}.*", "$options": "i"}},
                                  {"anotaciones": {"$regex": ".*${text}.*", "$options": "i"}}]`;
            }
            if(visto === 'false'){
                if(proveedor != '' || colegio != '' || status != '' || text != '' ) { query += "," };
                query += `"visto_por":` + false +``;
            }
            query += "}";
            const queryJSON = JSON.parse(query);
            [pedidos, total] = await Promise.all([Pedido.find(queryJSON).sort({ nombre: -1 })
                .populate('proveedor', '-__v -password').populate('colegio', '-__v')
                .populate('usuario_pedido', '-__v -password').populate('ingredientes', '-__v'),
                Pedido.countDocuments(queryJSON)
            ]);
        }
        res.json({
            ok: true,
            message: 'Aquí están los pedidos',
            pedidos,
            total
        });
    } catch (error) {
        console.log(error);
        res.json({
            ok: false,
            msg: 'Error obteniendo los pedidos'
        });
    }
}

const getPedidosByProveedor = async(req, res = response) => {
    
    const proveedor = req.query.proveedor || '';
    let query = { proveedor: proveedor, visto_por: false }
    let total = 0; let total_p = 0;
    try {
        const token = req.header('x-token');

        if (infoToken(token).rol !== 'ROL_PROVEEDOR') {
            return res.status(400).json({
                ok: false,
                msg: 'No tienes permisos para realizar esta acción',
            });
        }

        let pedidos = [];

        [pedidos, total] = await Promise.all([Pedido.find(query).sort({ nombre: -1 }),
            Pedido.countDocuments(query)
        ]);

        [total_pedidos, total_p] = await Promise.all([Pedido.find({proveedor: proveedor}).sort({ nombre: -1 }),
            Pedido.countDocuments({proveedor: proveedor})
        ]);

        res.json({
            ok: true,
            message: 'Aquí están los pedidos',
            pedidos,
            total_pedidos,
            total,
            total_p
        });
    } catch (error) {
        console.log(error);
        res.json({
            ok: false,
            msg: 'Error obteniendo los pedidos'
        });
    }
}

const crearPedidos = async(req, res = response) => {
    const { fecha_esperada, proveedor, ingredientes, cantidad } = req.body;

    try {
        const token = req.header('x-token');
        // solo usuarios con estos roles pueden realizar esta acción
        if (infoToken(token).rol !== 'ROL_ADMIN' && infoToken(token).rol !== 'ROL_COCINERO'
            && infoToken(token).rol !== 'ROL_SUPERVISOR') {
            return res.status(400).json({
                ok: false,
                msg: 'No tienes permisos para realizar esta acción',
            });
        }
        // los ingredientes y sus cantidades deben tener la misma longitud
        if(ingredientes.length != cantidad.length){
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
        // que el del usuario al que pertenezca el identificador pasado por token 
        if(!exist_user || exist_user.rol !== infoToken(token).rol){
            return res.status(400).json({
                ok: false,
                msg: 'Tu usuario no tiene permisos para realizar esta acción',
            });
        }
        let date1 = new Date(fecha_esperada);
        let date2 = new Date();
        if(date1 < date2){
            return res.status(400).json({
                ok: false,
                msg: 'La fecha esperada no puede ser menor a la actual',
            });
        }
        const prov = await Usuario.findById(proveedor);
        if(!prov || prov.colegio.toString() != exist_user.colegio.toString()){
            return res.status(400).json({
                ok: false,
                msg: 'Este proveedor no pertenece a tu colegio',
            });
        }
        const colegio = await Colegio.findById(prov.colegio);
        if(!colegio){
            return res.status(400).json({
                ok: false,
                msg: 'El colegio no es válido',
            });
        }
        // ahora tenemos que comprobar que el proveedor y el usuario tengan el mismo colegio
        // y que ese colegio exista

        // comprobamos que todos los identificadores que se pasan al array de ingredientes
        // sean realmente identificadores de ingredientes válidos dentro de la base de datos
        // tambien se comprueba que estos ingredientes realmente los provean el proveedor
        // que se pasa por parametro
        for (let i = 0; i < ingredientes.length; i++){
            let ing = await Ingrediente.findById(ingredientes[i]);
            if(!ing){
                return res.status(400).json({
                    ok: false,
                    msg: 'Hay algún ingrediente que no es válido',
                });
            }
            if(ing.proveedor.toString() != proveedor.toString()){
                return res.status(400).json({
                    ok: false,
                    msg: 'Este ingrediente no pertenece a este proveedor',
                });
            }
        }
        // creamos el nombre para el pedido
        let name_pedido = '';
        const pedidos = await Pedido.find();
        // si hay pedidos, 
        if(pedidos.length > 0){
            const ped = pedidos[pedidos.length - 1];
            const splitPedido = ped.nombre.split('');
            const lastCharacter = splitPedido[splitPedido.length - 1];
            const numberLastPedido = Number(lastCharacter);
            const numberPedido = numberLastPedido + 1;
            name_pedido = 'Pedido ' + numberPedido.toString();
        } else {
            name_pedido = 'Pedido 1'
        }
        // calculamos el precio del pedido
        let precio_pedido = 0;
        let cant_recep = [];
        for (let i = 0; i < ingredientes.length; i++){
            let ing = await Ingrediente.findById(ingredientes[i]);
            precio_pedido += (cantidad[i] * ing.precio);
            cant_recep.push(0);
        }

        const object = {
            nombre: name_pedido,
            fecha_esperada: fecha_esperada,
            anotaciones: req.body.anotaciones,
            proveedor: proveedor,
            ingredientes: ingredientes,
            cantidad: cantidad,
            usuario_pedido: exist_user._id,
            colegio: colegio._id,
            precio: precio_pedido,
            cantidad_recepcionada: cant_recep
        }
        //Creamos nuevo provincia
        const pedido = new Pedido(object);
        // Almacenar en BD
        await pedido.save();

        res.json({
            ok: true,
            msg: 'El pedido: ' + pedido.nombre + ' ha sido registrado con éxito',
            pedido,
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error creando el pedido'
        });
    }
}

const updatePedido = async(req, res = response) => {
    const { fecha_esperada, ingredientes, anotaciones, cantidad } = req.body;
    const id = req.params.id || '';

    try {
        const token = req.header('x-token');
        //solo pueden modificar un registro de comensales esos roles
        if (infoToken(token).rol != 'ROL_ADMIN' && infoToken(token).rol !== 'ROL_COCINERO'
            && infoToken(token).rol !== 'ROL_SUPERVISOR') {
            return res.status(400).json({
                ok: false,
                msg: 'No tienes permisos para realizar esta acción',
            });
        }

        if(ingredientes.length != cantidad.length){
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
        // solo se pueden modificar pedidos que estén sin completar o que estén 
        const exist_pedido = await Pedido.findById(id);
        if(!exist_pedido || exist_pedido.estado !== 'Pendiente'){
            return res.status(400).json({
                ok: false,
                msg: 'No existe este pedido o está completado o parcialmente completado',
            });
        }
        let date1 = new Date(fecha_esperada);
        let date2 = new Date();
        if(date1 < date2){
            return res.status(400).json({
                ok: false,
                msg: 'La fecha esperada no puede ser menor a la actual',
            });
        }
        // hacemos con los ingredientes lo mismo que en el POST de la api
        for (let i = 0; i < ingredientes.length; i++){
            let ing = await Ingrediente.findById(ingredientes[i]);
            if(!ing){
                return res.status(400).json({
                    ok: false,
                    msg: 'Hay algún ingrediente que no es válido',
                });
            }
            if(ing.proveedor.toString() != exist_pedido.proveedor.toString()){
                return res.status(400).json({
                    ok: false,
                    msg: 'Este ingrediente no pertenece a este proveedor',
                });
            }
        }

        if(infoToken(token).rol !== 'ROL_ADMIN') {
            if (infoToken(token).uid.toString() != exist_pedido.usuario_pedido.toString()){
                return res.status(400).json({
                    ok: false,
                    msg: 'Tu usuario no tiene permisos para realizar esta acción',
                });
            }
        }

        let precio_pedido = 0;
        let cant_recep = [];
        for (let i = 0; i < ingredientes.length; i++){
            let ing = await Ingrediente.findById(ingredientes[i]);
            precio_pedido += (cantidad[i] * ing.precio);
            cant_recep.push(0);
        }

        const object = {
            ingredientes: ingredientes,
            cantidad: cantidad,
            anotaciones: anotaciones,
            fecha_esperada: fecha_esperada,
            precio: precio_pedido,
            cantidad_recepcionada: cant_recep
        }

        const pedido = await Pedido.findByIdAndUpdate(id, object, { new: true })

        res.json({
            ok: true,
            msg: 'El pedido ' + pedido.nombre + ' ha sido modificado con éxito',
            pedido
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error modificando el pedido'
        });
    }
}

// recepcionar pedidos
const recepcionarPedido = async(req, res = response) => {
    const { cantidad_recepcionada } = req.body;
    const id = req.params.id || '';

    try {
        const token = req.header('x-token');
        //solo pueden modificar un registro de comensales esos roles
        if (infoToken(token).rol != 'ROL_ADMIN' && infoToken(token).rol !== 'ROL_COCINERO'
            && infoToken(token).rol !== 'ROL_SUPERVISOR') {
            return res.status(400).json({
                ok: false,
                msg: 'No tienes permisos para realizar esta acción',
            });
        }
        
        // solo se pueden recepcionar pedidos que no estén entregados
        const exist_pedido = await Pedido.findById(id).populate('ingredientes');
        if(!exist_pedido || exist_pedido.estado === 'Entregado'){
            return res.status(400).json({
                ok: false,
                msg: 'No existe este pedido o está completado o parcialmente completado',
            });
        }

        if (!exist_pedido.visto_por) {
            return res.status(400).json({
                ok: false,
                msg: 'No se puede recepcionar un pedido hasta que no lo vea su proveedor',
            });
        }

        // compara la longitudo del array de cantidades de los pedidos con el de la cantidad recepcionada

        if(exist_pedido.cantidad.length !== cantidad_recepcionada.length){
            return res.status(400).json({
                ok: false,
                msg: 'Los datos enviados son erróneos',
            });
        }
        // hacemos con los ingredientes lo mismo que en el POST de la api

        if(infoToken(token).rol !== 'ROL_ADMIN') {
            if (infoToken(token).uid.toString() != exist_pedido.usuario_pedido.toString()){
                return res.status(400).json({
                    ok: false,
                    msg: 'Tu usuario no tiene permisos para realizar esta acción',
                });
            }
        }
        
        let cant_recep_total = exist_pedido.cantidad_recepcionada;
    
        // Se suma la cantidad recibida a la cantidad que hay actualmente
        for(let i = 0; i < cantidad_recepcionada.length; i++){
            cant_recep_total[i] = cant_recep_total[i] + cantidad_recepcionada[i];
        }
        // ahora vamos a comprobar que ningun ingrediente supere la cantidad pedida
        for(let i = 0; i < cant_recep_total.length; i++){
            if(exist_pedido.cantidad[i] < cant_recep_total[i]){
                return res.status(400).json({
                    ok: false,
                    msg: 'La cantidad recibida para el ingrediente: ' + exist_pedido.ingredientes[i].nombre + ' es mayor de la solicitada',
                });
            }
        }

        // ahora vamos a comprobar el estado en el que debemos poner el pedido una vez vemos
        // que la cantidad recepcionada total no supera la cantidad pedida
        let visto = true;
        let estado_recepcion = false;
        for(let i = 0; i < cant_recep_total.length; i++){
            if(exist_pedido.cantidad[i] != cant_recep_total[i]){
                estado_recepcion = true;
                visto = false;
                break;
            }
        }

        let estado_final = estado_recepcion ? 'Parcialmente Completado' : 'Entregado';

        const object = {
            cantidad_recepcionada: cant_recep_total,
            estado: estado_final,
            visto_por: visto
        }

        for(let i = 0; i < cantidad_recepcionada.length; i++){
            let ing = await Ingrediente.findById(exist_pedido.ingredientes[i]._id);
            ing.stock_actual += cantidad_recepcionada[i];
            await ing.save();
        }

        const pedido = await Pedido.findByIdAndUpdate(id, object, { new: true });
        res.json({
            ok: true,
            msg: 'El pedido ' + pedido.nombre + ' ha sido modificado con éxito',
            pedido
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error modificando el pedido'
        });
    }
}


const borrarPedido = async(req, res = response) => {
    const id = req.params.id || '';

    try {
        const token = req.header('x-token');
        // comprobamos que no se
        if ((infoToken(token).rol !== 'ROL_ADMIN')) {
            return res.status(400).json({
                ok: false,
                msg: 'No tienes permisos para realizar esta acción',
            });
        }
        // comprobamos la existencia del pedido y que el estado sea completado,
        // si no no se puede eliminar
        const exist_Pedido = await Pedido.findById(id);
        if (!exist_Pedido || exist_Pedido.estado !== 'Entregado') {
            return res.status(400).json({
                ok: false,
                msg: 'El identificador del pedido no es válido o no está completado'
            });
        }
        // Modificamos el objeto en base de datos
        const pedido = await Pedido.findByIdAndRemove(id);

        res.json({
            ok: true,
            msg: 'El pedido ' + pedido.nombre + ' ha sido eliminando con éxito',
            pedido,
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error eliminando el pedido'
        });
    }

}

module.exports = { getPedidos, getPedidosByProveedor, crearPedidos, updatePedido, recepcionarPedido, borrarPedido }
const { response } = require('express');
const mongoose = require('mongoose');
const Plato = require('../models/plato');
const Ingrediente = require('../models/ingrediente');
const Usuario = require('../models/usuario');
const Colegio = require('../models/Colegio');
const Menu = require('../models/Menu');
const { infoToken } = require('../helpers/infoToken');

const getMenus = async(req, res = response) => {
    
    const id = req.query.id;
    const dia = req.query.dia || '';
    const plato = req.query.plato || ''
    const colegio = req.query.colegio || '';
    const tipo = req.query.tipo || '';
    let query = "{";
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

        let menus = [];

        if (id) {
            [menus, total] = await Promise.all([Menu.findById(id),
                Menu.countDocuments({_id: id}),
            ]);
        } else{
            if(dia != ''){
                let diaa =  `"${dia}"`;
                query += `"dia":` + diaa + ``;
            }
            if(plato != ''){
                if(dia != '') { query += " , " };
                if(tipo != ''){
                    query += `"$or": [{ "plato1": "${plato}" }, { "plato2": "${plato}"}`;
                } else {
                    query += `"$or": [{ "plato1": "${plato}" }, { "plato2": "${plato}"}]`;
                }
            }
            if(tipo != ''){
                if(dia != '' || plato != '') { query += " , " };
                if(plato != ''){
                    query += `{"nombre": {"$regex": ".*${tipo}.*", "$options": "i"}}]`;
                } else {
                    query += `"$or": [{"nombre": {"$regex": ".*${tipo}.*", "$options": "i"}}]`;
                }
            }
            if(colegio != ''){
                let col = `"${colegio}"`;
                if(dia != '' || plato != '' || tipo != '') { query += " , " };
                query += `"colegio": ` + col + ``;
            }

            query += "}";
            const queryJSON = JSON.parse(query);
            [menus, total] = await Promise.all([Menu.find(queryJSON).sort({ dia: -1 })
                .populate('colegio', '-__v').populate('plato1', '-__v').populate('plato2', '-__v')
                .populate('postre', '-__v').populate('ensalada', '-__v'),
                Menu.countDocuments(queryJSON)
            ]);
        }
        res.json({
            ok: true,
            message: 'Aquí están los menús',
            menus,
            total
        });
    } catch (error) {
        console.log(error);
        res.json({
            ok: false,
            msg: 'Error obteniendo los menús'
        });
    }
}

const crearMenu = async(req, res = response) => {
    const { nombre, dia, colegio, plato1, plato2, ensalada, postre } = req.body;

    try {
        const token = req.header('x-token');
        // solo usuarios con estos roles pueden realizar esta acción
        if (infoToken(token).rol !== 'ROL_ADMIN' && infoToken(token).rol !== 'ROL_SUPERVISOR') {
            return res.status(400).json({
                ok: false,
                msg: 'No tienes permisos para realizar esta acción',
            });
        }
        if(nombre != 'estandar' && nombre != 'alergicos'){
            return res.status(400).json({
                ok: false,
                msg: 'Los menús solo pueden ser estándar o para alérgicos',
            });
        }
        // comprobamos que el plato no exista en la base de datos
        let nom_menu = new RegExp(nombre, 'i');
        const exist_menu = await Menu.find({colegio: colegio, dia: dia, $or: [{ nombre: nom_menu }]});
        if(exist_menu.length > 0){
            return res.status(400).json({
                ok: false,
                msg: 'El menú ' + nombre + ' de este día ya está disponible en tu colegio',
            });
        }
        // comprobamos la existencia de los platos y del postre en la base de datos
        const exist_primer_plato = await Plato.findById(plato1);
        if(!exist_primer_plato){
            return res.status(400).json({
                ok: false,
                msg: 'El primer plato no existe en la base de datos',
            });
        }

        const exist_segundo_plato = await Plato.findById(plato2);
        if(!exist_segundo_plato){
            return res.status(400).json({
                ok: false,
                msg: 'El segundo plato no existe en la base de datos',
            });
        }

        // si la ensalada llega como parámetro se comprueba que exista
        const exist_ensalada = await Plato.findById(ensalada);
        if(ensalada && !exist_ensalada){
            return res.status(400).json({
                ok: false,
                msg: 'La ensalada no existe en la base de datos',
            });
        }

        const exist_postre = await Ingrediente.findById(postre);
        if(!exist_postre){
            return res.status(400).json({
                ok: false,
                msg: 'El postre no existe en la base de datos',
            });
        }
        
        if(plato1 == plato2 || plato1 == ensalada || plato2 == ensalada){
            return res.status(400).json({
                ok: false,
                msg: 'No se pueden repetir ningún plato en el menú',
            });
        }
        // Comprobar que existe el usuario de la base de datos que se pasa
        // como token
        const exist_user = await Usuario.findById(infoToken(token).uid);
        // comprobamos que el usuario sea válido y el rol del token de usuario sea el mismo
        // que el del usuario al que pertenezca el identificador pasado por token
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
        // comprobamos que el dia de menú no haya pasado ya
        let date1 = new Date(dia);
        let date2 = new Date();
        if(date1 < date2){
            return res.status(400).json({
                ok: false,
                msg: 'El dia de menú no puede ser menor al actual',
            });
        }

        // ahora tenemos que comprobar que el proveedor y el usuario tengan el mismo colegio
        // y que ese colegio exista

        // comprobamos que los platos pertenezcan al colegio donde se van a servirc
        let arrplatos = [];
        arrplatos.push(exist_primer_plato);
        arrplatos.push(exist_segundo_plato);
        if(exist_ensalada) arrplatos.push(exist_ensalada);

        for(let i = 0; i < arrplatos.length; i++){
            if(arrplatos[i].colegio.toString() != colegio.toString()){
                return res.status(400).json({
                    ok: false,
                    msg: 'El plato: ' + arrplatos[i].nombre + ' no pertenece a este colegio.',
                });
            }
        }
        
        // calculamos el precio del plato
        let coste = exist_primer_plato.coste_racion + exist_segundo_plato.coste_racion + exist_postre.precio;
        if(exist_ensalada) {
            coste += exist_ensalada.coste_racion;
        }

        let nom = nombre + '_' + dia.toString();
        
        const object = {
            nombre: nom,
            dia: dia,
            plato1: plato1,
            plato2: plato2,
            postre: postre,
            ensalada: ensalada,
            colegio: colegio,
            coste: coste,
            anotaciones: req.body.anotaciones,
        }
        //Creamos nuevo menu
        const menu = new Menu(object);
        // Almacenar en BD
        await menu.save();

        res.json({
            ok: true,
            msg: 'El menu: ' + menu.nombre + ' ha sido registrado con éxito',
            menu
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error creando el menu'
        });
    }
}

const updateMenu = async(req, res = response) => {
    const { nombre, dia, colegio, plato1, plato2, ensalada, postre } = req.body;
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
        
        const exist_menu_ = await Menu.findById(id);
        if(!exist_menu_){
            return res.status(400).json({
                ok: false,
                msg: 'Este menú no existe en la base de datos',
            });
        }

        if(nombre != 'estandar' && nombre != 'alergicos'){
            return res.status(400).json({
                ok: false,
                msg: 'Los menús solo pueden ser estándar o para alérgicos',
            });
        }
        // comprobamos que el plato no exista en la base de datos
        let nom_menu = new RegExp(nombre, 'i');
        const exist_menu = await Menu.find({colegio: colegio, dia: dia, $or: [{ nombre: nom_menu }]});
        if(exist_menu.length > 0 && exist_menu[0]._id.toString() != exist_menu_._id.toString()){
            return res.status(400).json({
                ok: false,
                msg: 'El menú ' + nombre + ' de este día ya está disponible en tu colegio',
            });
        }
        // comprobamos la existencia de los platos y del postre en la base de datos
        const exist_primer_plato = await Plato.findById(plato1);
        if(!exist_primer_plato){
            return res.status(400).json({
                ok: false,
                msg: 'El primer plato no existe en la base de datos',
            });
        }

        const exist_segundo_plato = await Plato.findById(plato2);
        if(!exist_segundo_plato){
            return res.status(400).json({
                ok: false,
                msg: 'El segundo plato no existe en la base de datos',
            });
        }

        // si la ensalada llega como parámetro se comprueba que exista
        const exist_ensalada = await Plato.findById(ensalada);
        if(ensalada && !exist_ensalada){
            return res.status(400).json({
                ok: false,
                msg: 'La ensalada no existe en la base de datos',
            });
        }

        const exist_postre = await Ingrediente.findById(postre);
        if(!exist_postre){
            return res.status(400).json({
                ok: false,
                msg: 'El postre no existe en la base de datos',
            });
        }
        
        if(plato1 == plato2 || plato1 == ensalada || plato2 == ensalada){
            return res.status(400).json({
                ok: false,
                msg: 'No se pueden repetir ningún plato en el menú',
            });
        }
        // Comprobar que existe el usuario de la base de datos que se pasa
        // como token
        const exist_user = await Usuario.findById(infoToken(token).uid);
        // comprobamos que el usuario sea válido y el rol del token de usuario sea el mismo
        // que el del usuario al que pertenezca el identificador pasado por token
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
        // comprobamos que el dia de menú no haya pasado ya
        let date1 = new Date(dia);
        let date2 = new Date();
        if(date1 < date2){
            return res.status(400).json({
                ok: false,
                msg: 'El dia de menú no puede ser menor al actual',
            });
        }

        // ahora tenemos que comprobar que el proveedor y el usuario tengan el mismo colegio
        // y que ese colegio exista

        // comprobamos que los platos pertenezcan al colegio donde se van a servirc
        let arrplatos = [];
        arrplatos.push(exist_primer_plato);
        arrplatos.push(exist_segundo_plato);
        if(exist_ensalada) arrplatos.push(exist_ensalada);

        for(let i = 0; i < arrplatos.length; i++){
            if(arrplatos[i].colegio.toString() != colegio.toString()){
                return res.status(400).json({
                    ok: false,
                    msg: 'El plato: ' + arrplatos[i].nombre + ' no pertenece a este colegio.',
                });
            }
        }
        
        // calculamos el precio del plato
        let coste = exist_primer_plato.coste_racion + exist_segundo_plato.coste_racion + exist_postre.precio;
        if(exist_ensalada) {
            coste += exist_ensalada.coste_racion;
        }

        let nom = nombre + '_' + dia.toString();
        
        let salad = exist_ensalada ? ensalada : null;

        const object = {
            nombre: nom,
            dia: dia,
            plato1: plato1,
            plato2: plato2,
            postre: postre,
            ensalada: salad,
            coste: coste,
            anotaciones: req.body.anotaciones,
        }
        // editar menu
        const menu = await Menu.findByIdAndUpdate(id, object, { new: true })

        res.json({
            ok: true,
            msg: 'El menu ' + menu.nombre + ' ha sido modificado con éxito',
            menu
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error modificando el menú'
        });
    }
}

// recepcionar pedidos

const borrarMenu = async(req, res = response) => {
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
        // comprobamos la existencia del menú
        const exist_menu = await Menu.findById(id);
        if (!exist_menu) {
            return res.status(400).json({
                ok: false,
                msg: 'El identificador del menú no es válido'
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
            if(exist_user.colegio.toString() !== exist_menu.colegio.toString()){
                return res.status(400).json({
                    ok: false,
                    msg: 'Este menu no tienes permisos para eliminarlo'
                });
            }
        }
        const menu = await Menu.findByIdAndRemove(id);

        res.json({
            ok: true,
            msg: 'El menú: ' + menu.nombre + ' ha sido eliminando con éxito',
            menu,
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error eliminando el menú'
        });
    }

}

module.exports = { getMenus, crearMenu, updateMenu, borrarMenu }
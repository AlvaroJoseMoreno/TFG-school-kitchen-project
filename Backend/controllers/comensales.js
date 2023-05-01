const { response } = require('express');
const mongoose = require('mongoose');
const Comensal = require('../models/comensales');
const Colegio = require('../models/Colegio');
const Usuario = require('../models/usuario');
const { infoToken } = require('../helpers/infoToken');

const getComensales = async(req, res = response) => {
    
    const id = req.query.id;
    const date = req.query.fecha || '';
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

        let comensales = [];

        if (id) {
            [comensales, total] = await Promise.all([Comensal.findById(id),
                Comensal.countDocuments({_id: id})
            ]); 
        } else {  
            if (colegio != '') {
                if(date != ''){
                    query = { colegio: colegio,  fecha: date  }
                } else {
                    query = { colegio: colegio }
                }
            } else {
                if(date != ''){
                    query = { fecha: date }
                }
            }

            [comensales, total] = await Promise.all([Comensal.find(query).sort({ fecha: 1 })
                .populate('colegio', '-__v').populate('usuario', '-__v -password'),
                Comensal.countDocuments(query)
            ]);

        }  

        res.json({
            ok: true,
            message: 'Aquí están los comensales',
            comensales,
            total
        });
    } catch (error) {
        console.log(error);
        res.json({
            ok: false,
            msg: 'Error obteniendo los comensales'
        });
    }
}

const getComensalesByFecha = async(req, res = response) => {
    
    const date1 = req.query.fecha1 || '';
    const date2 = req.query.fecha2 || ''; 
    let total = 0;

    try {
        const token = req.header('x-token');

        if (infoToken(token).rol !== 'ROL_ADMIN') {
            return res.status(400).json({
                ok: false,
                msg: 'No tienes permisos para realizar esta acción',
            });
        }

        if(date1 == '' || date2 == ''){
            return res.status(400).json({
                ok: false,
                msg: 'Tienen que estar las dos fechas',
            });
        }

        let comensales = [];
        let query = { fecha: { $gte: date1, $lte: date2} };

        [comensales, total] = await Promise.all([Comensal.find(query).sort({ fecha: 1 }),
            Comensal.countDocuments(query)
        ]);

        let date_comensales = []; // { date: date, num_comen: num };
        let num_com = 0;

        for(let i = 0; i < comensales.length; i++){
            num_com += comensales[i].num_comensales;
            if(comensales[i+1] != undefined){
                let f1 = new Date(comensales[i].fecha);
                let f1_f = f1.toString();
                let f2 = new Date(comensales[i+1].fecha);
                let f2_f = f2.toString();

                if(f1_f != f2_f){
                    let reg = { fecha: f1, num_comensales: num_com };
                    date_comensales.push(reg);
                    num_com = 0; 
                }
            } else if(i == comensales.length - 1){
                let f1 = new Date(comensales[i].fecha);
                let f1_f = f1.toString();
                let reg = { fecha: f1, num_comensales: num_com };
                date_comensales.push(reg);
            }
        }

        res.json({
            ok: true,
            //message: 'Aquí están los comensales por rango de dias',
            //comensales,
            //total,
            date_comensales
        });
    } catch (error) {
        console.log(error);
        res.json({
            ok: false,
            msg: 'Error obteniendo los comensales'
        });
    }
}

const crearComensales = async(req, res = response) => {
    const { usuario, colegio, fecha } = req.body;

    try {
        const token = req.header('x-token');

        // Comprobar que existe el usuario que crea el
        const exist_user = await Usuario.findById(usuario);
        if(!exist_user){
            return res.status(400).json({
                ok: false,
                msg: 'El usuario que crea el registro de comensales no es valido',
            });
        }

        if ((infoToken(token).rol !== 'ROL_ADMIN' && infoToken(token).rol !== 'ROL_COCINERO')) {
            return res.status(400).json({
                ok: false,
                msg: 'No tienes permisos para realizar esta acción',
            });
        }

        const exist_colegio = await Colegio.findById(colegio);
        if(!exist_colegio){
            return res.status(400).json({
                ok: false,
                msg: 'El colegio del registro de comensales no es valido',
            });
        }

        if(infoToken(token).rol !== 'ROL_ADMIN' && infoToken(token).rol === 'ROL_COCINERO'){
            if(infoToken(token).uid.toString() != exist_user._id.toString()  
                || exist_colegio._id.toString() != exist_user.colegio.toString()){
                return res.status(400).json({
                    ok: false,
                    msg: 'No tienes permisos para realizar esta acción',
                });
            }
        }

        if(exist_colegio._id.toString() != exist_user.colegio.toString()){
            return res.status(400).json({
                ok: false,
                msg: 'Este usuario no puede crear un registro de comensales para este colegio',
            });
        }

        const exist_reg = await Comensal.findOne({ fecha: fecha, colegio: colegio });
        if(exist_reg){
            return res.status(400).json({
                ok: false,
                msg: 'Ya se ha creado un registro de comensales este día',
            });
        }

        //Creamos nuevo provincia
        const comensal = new Comensal(req.body);
        // Almacenar en BD
        await comensal.save();

        res.json({
            ok: true,
            msg: 'El registro de comensales ha sido registrado con éxito',
            comensal,
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error creando los comensales'
        });
    }
} 

//queda por hacer esto y el get provinces by num colegios

const updateComensales = async(req, res = response) => {
    const { fecha, colegio, usuario } = req.body;
    const id = req.params.id || '';

    try {
        const token = req.header('x-token');
        //solo pueden modificar un registro de comensales esos roles
        if ((infoToken(token).rol !== 'ROL_ADMIN' && infoToken(token).rol !== 'ROL_COCINERO' && infoToken(token).rol !== 'ROL_SUPERVISOR')) {
            return res.status(400).json({
                ok: false,
                msg: 'No tienes permisos para realizar esta acción',
            });
        }
        //comprobamos que el usuario que se pasa por parámetro ya existe
        const exist_user = await Usuario.findById(usuario);
        if(!exist_user){
            return res.status(400).json({
                ok: false,
                msg: 'No existe un este usuario',
            }); 
        }

        //comprobar identificador del registro de comensales
        const exists_comensales = await Comensal.findById(id);
        if (!exists_comensales) {
            return res.status(400).json({
                ok: false,
                msg: 'El identificador del registro de comensales no es válido'
            });
        }
        // Comprobar que para la fecha que se registran los comensales, no exista ya un 
        // registro en el mismo colegio.
        const exist_reg = await Comensal.findOne({ fecha: fecha, colegio: colegio });
        if(exist_reg && exist_reg._id.toString() !== exists_comensales._id.toString()){
            return res.status(400).json({
                ok: false,
                msg: 'Ya se ha creado un registro de comensales este día',
            });
        }
        //comprobamos que el colegio que se por parametro ya existe
        const exist_colegio = await Colegio.findById(colegio);
        if (!exist_colegio) {
            return res.status(400).json({
                ok: false,
                msg: 'El identificador del colegio no es válido'
            });
        }
        //comprobamos que si el rol de usuario es cocinero o supervisor solo pueda
        //modificar el registro si es el token de usuario es del usuario que pretende
        //modificar el registro
        if(infoToken(token).rol !== 'ROL_ADMIN' && (infoToken(token).rol === 'ROL_COCINERO' || infoToken(token).rol === 'ROL_SUPERVISOR')){
            if(infoToken(token).uid.toString() != exist_user._id.toString() 
               || exist_colegio._id.toString() != exist_user.colegio.toString()){
                return res.status(400).json({
                    ok: false,
                    msg: 'No tienes permisos para realizar esta acción',
                });
            }
        }
        //se comprueba que el colegio que viene por parametro y el colegio del
        //usuario sea el mismo, ya que un cocinero o supervisor solo pueden modificar
        //registros de su colegio
        if(exist_colegio._id.toString() != exist_user.colegio.toString()){
            return res.status(400).json({
                ok: false,
                msg: 'Este usuario no puede crear un registro de comensales para este colegio',
            });
        }

        const comensal = await Comensal.findByIdAndUpdate(id, req.body, { new: true })

        res.json({
            ok: true,
            msg: 'El registro de comensales ha sido modificada con éxito',
            comensal
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error modificando el registro de comensales'
        });
    }
}

const borrarComensales = async(req, res = response) => {

    const id = req.params.id || '';

    try {
        const token = req.header('x-token');
        const reg_comensal = await Comensal.findById(id);

        if(!reg_comensal){
            return res.status(400).json({
                ok: false,
                msg: 'No existe el registro de comensales',
            });
        }

        const user = await Usuario.findById(reg_comensal.usuario);
        // comprobamos que no se
        if ((infoToken(token).rol !== 'ROL_ADMIN' && infoToken(token).rol !== 'ROL_COCINERO')) {
            return res.status(400).json({
                ok: false,
                msg: 'No tienes permisos para realizar esta acción',
            });
        }
        
        //comprobar identificador de colegio del registro
        const exists_col = await Colegio.findById(reg_comensal.colegio);

        if (!exists_col) {
            return res.status(400).json({
                ok: false,
                msg: 'El identificador del colegio no es válido'
            });
        }

        // comprobamos que el usuario que va a borrar sea o un admin o bien del mismo colegio
        // que tiene asignado el usuario
        if(infoToken(token).rol !== 'ROL_ADMIN' && (infoToken(token).rol === 'ROL_COCINERO' || infoToken(token).rol === 'ROL_SUPERVISOR')){
            if(infoToken(token).uid.toString() != user._id.toString() 
               || exists_col._id.toString() != user.colegio.toString()){
                return res.status(400).json({
                    ok: false,
                    msg: 'No tienes permisos para realizar esta acción',
                });
            }
        }
        
        // Modificamos el objeto en base de datos
        const comensal = await Comensal.findByIdAndRemove(id);

        res.json({
            ok: true,
            msg: 'El registro de comensales ha sido eliminando con éxito',
            comensal,
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error eliminando el registro de comensales'
        });
    }

}

module.exports = { getComensales, getComensalesByFecha, crearComensales, updateComensales, borrarComensales }
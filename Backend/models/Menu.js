
const { Schema, model } = require('mongoose');

const MenuSchema = Schema({
    nombre: {
        type: String,
        require: true
    },
    dia: {
        type: Date,
        require: true
    },
    plato1: {
        type: Schema.Types.ObjectId,
        ref: 'Plato',
        require: true
    },
    plato2: {
        type: Schema.Types.ObjectId,
        ref: 'Plato',
        require: true
    },
    ensalada: {
        type: Schema.Types.ObjectId,
        ref: 'Plato'
    },
    postre: {
        type: Schema.Types.ObjectId,
        ref: 'Ingrediente',
        require: true
    },
    colegio: {
        type: Schema.Types.ObjectId,
        ref: 'Colegio',
        require: true
    },
    coste: {
        type: Number
    },
    anotaciones: {
        type: String   
    }
}, { collection: 'menus' });

MenuSchema.method('toJSON', function() {
    const { __v, _id, ...object } = this.toObject();

    object.uid = _id;
    return object;
})

module.exports = model('Menu', MenuSchema);
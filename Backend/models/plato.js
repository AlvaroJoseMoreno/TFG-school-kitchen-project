// Usuario pedido: Usuario (O)
// Colegio

const { Schema, model } = require('mongoose');

const PlatoSchema = Schema({
    nombre: {
        type: String,
        require: true
    },
    categoria: {
        type: String,
        require: true    
    },
    receta: {
        type: String,    
    },
    ingredientes: [{
        type: Schema.Types.ObjectId,
        ref: 'Ingrediente',
        require: true
    }],
    alergenos: [{
        type: String
    }],
    cantidad_ingredientes: [{
        type: Number,
        require: true
    }],
    coste_racion: {
        type: Number
    },
    colegio: {
        type: Schema.Types.ObjectId,
        ref: 'Colegio',
        require: true
    }
}, { collection: 'platos' });

PlatoSchema.method('toJSON', function() {
    const { __v, _id, ...object } = this.toObject();

    object.uid = _id;
    return object;
})

module.exports = model('Plato', PlatoSchema);
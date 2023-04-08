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
        //require: true    
    },
    receta: {
        type: String,
        //require: true    
    },
    ingredientes: [{
        type: Schema.Types.ObjectId,
        ref: 'ingrediente',
        require: true
    }],
    cantidad_ingredientes: [{
        type: Number,
        require: true
    }],
    coste: {
        type: Number,
        require: true
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
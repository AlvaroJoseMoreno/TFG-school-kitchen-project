const { Schema, model } = require('mongoose');

const IngredienteSchema = Schema({
    nombre: {
        type: String,
        require: true
    },
    unidad_medida: {
        type: String,
        require: true
    },
    precio: {
        type: Number,
        require: true    
    },
    alergenos: [{
        type: String
    }],
    imagen: {
        type: String,
        default: 'default_ingrediente.png'
    },
    proveedor: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario'
    },
    stock_actual: {
        type: Number,
        require: true,
        default: 0    
    },
}, { collection: 'ingredientes' });

IngredienteSchema.method('toJSON', function() {
    const { __v, _id, ...object } = this.toObject();

    object.uid = _id;
    return object;
})

module.exports = model('Ingrediente', IngredienteSchema);
const { Schema, model } = require('mongoose');

const PedidoSchema = Schema({
    nombre: {
        type: String,
        require: true
    },
    fecha_pedido: {
        type: Date,
        default: Date.now
    },
    fecha_esperada: {
        type: Date,
        require: true
    },
    anotaciones: {
        type: String,
        //require: true    
    },
    estado: {
        type: String,
        default: 'Pendiente',
        require: true    
    },
    ingredientes: [{
        type: Schema.Types.ObjectId,
        ref: 'ingrediente',
        require: true
    }],
    cantidad: [{
        type: Number,
        require: true
    }],
    cantidad_recepcionada: [{
        type: Number
    }],
    precio: {
        type: Number,
        require: true
    },
    proveedor: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        require: true
    },
    usuario_pedido: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        require: true
    },
    colegio: {
        type: Schema.Types.ObjectId,
        ref: 'Colegio',
        require: true
    }
}, { collection: 'pedidos' });

PedidoSchema.method('toJSON', function() {
    const { __v, _id, ...object } = this.toObject();

    object.uid = _id;
    return object;
})

module.exports = model('Pedido', PedidoSchema);

// Colegio: Colegio

const { Schema, model } = require('mongoose');

const UsuarioSchema = Schema({
    nombre: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true,
        unique: true
    },
    password: {
        type: String    
    },
    telefono: {
        type: String,
        //require: true    
    },
    imagen: {
        type: String,
        default: 'default_picture.jpg'
    },
    rol: {
        type: String,
        require: true
    },
    code: {
        type: String,
        require: true
    },
    tipo_proveedor: {
        type: String
    },
    registerDate: {
        type: Date,
        default: Date.now
    },
    ciudad: {
        type: String,
        require: true
    },
    colegio: {
        type: Schema.Types.ObjectId,
        ref: 'Colegio',
        require: true
    }
}, { collection: 'usuarios' });

UsuarioSchema.method('toJSON', function() {
    const { __v, _id, password, ...object } = this.toObject();

    object.uid = _id;
    return object;
})

module.exports = model('Usuario', UsuarioSchema);
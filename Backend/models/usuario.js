// Id: Id (O)
// Email: string (U)
// Password: string (O)
// Nombre: string (O)
// Teléfono: string
// Rol: string (O)
// Tipo proveedor: string
// Ciudad: string
// Imagen: File
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
        type: String,
        require: true    
    },
    telefono: {
        type: String,
        //require: true    
    },
    imagen: {
        type: String,
        //default: 'default_picture.jpg'
    },
    rol: {
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
    /*colegio: {
        type: Schema.Types.ObjectId,
        ref: 'Colegio',
        require: true
    }*/
}, { collection: 'usuarios' });

UsuarioSchema.method('toJSON', function() {
    const { __v, _id, password, ...object } = this.toObject();

    object.uid = _id;
    return object;
})

module.exports = model('Usuario', UsuarioSchema);
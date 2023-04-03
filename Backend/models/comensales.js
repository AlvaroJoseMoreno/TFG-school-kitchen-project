// Id: ID (O)
// Fecha: Date (O)
// Núm comensal: number (O)
// Colegio: Colegio (O)
// Registrado por: Usuario (O)

const { Schema, model } = require('mongoose');

const comensalesSchema = Schema({
    fecha: {
        type: Date,
        require: true
    },
    num_comensales: {
        type: Number,
        require: true
    },
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'usuario',
        require: true
    },
    colegio: {
        type: Schema.Types.ObjectId,
        ref: 'colegio',
        require: true
    }
}, { collection: 'comensales' });

comensalesSchema.method('toJSON', function() {
    const { __v, _id, ...object } = this.toObject();

    object.uid = _id;
    return object;
})

module.exports = model('comensales', comensalesSchema);
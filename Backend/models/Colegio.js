const { Schema, model } = require('mongoose');

const ColegioSchema = Schema({
    nombre: {
        type: String,
        require: true
    },
    direccion: {
        type: String,
        require: true
    },
    telefono: {
        type: String,
        require: true
    },
    provincia: {
        type: Schema.Types.ObjectId,
        ref: 'Provincia',
        require: true
    }
}, { collection: 'colegios' });

ColegioSchema.method('toJSON', function() {
    const { __v, _id, ...object } = this.toObject();

    object.uid = _id;
    return object;
})

module.exports = model('Colegio', ColegioSchema);
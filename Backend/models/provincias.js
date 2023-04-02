const { Schema, model } = require('mongoose');

const ProvinciasSchema = Schema({
    nombre: {
        type: String,
        require: true,
        unique: true
    },
    codigo: {
        type: String,
        require: true    
    },
    num_colegios: {
        type: Number,
        default: 0
    }
}, { collection: 'provincias' });

ProvinciasSchema.method('toJSON', function() {
    const { __v, _id, ...object } = this.toObject();

    object.uid = _id;
    return object;
})

module.exports = model('Provincias', ProvinciasSchema);
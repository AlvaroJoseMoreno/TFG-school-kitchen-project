const Usuario = require('../models/usuario');
const Ingrediente = require('../models/ingrediente');
const fs = require('fs');
const { infoToken } = require('../helpers/infoToken');

const updateImagenes = async(tipo, path, nombreArchivo, id, token) => {

    switch (tipo) {
       
        case 'fotoperfil':
            const usuario = await Usuario.findById(id);
            if (!usuario) {
                return false;
            }
            // Comprobar que el id de usuario que actualiza es el mismo id del token
            // solo el usuario puede cambiar su foto
            if (infoToken(token).uid !== id) {
                console.log('el usuario que actualiza no es el propietario de la foto')
                return false;
            }

            const fotoVieja = usuario.imagen;
            const pathFotoVieja = `${path}/${fotoVieja}`;
            if (fotoVieja && fs.existsSync(pathFotoVieja) && fotoVieja != 'default_picture.jpg') {
                fs.unlinkSync(pathFotoVieja);
            }

            usuario.imagen = nombreArchivo;
            await usuario.save();

            return true;

            break;

        case 'fotoingrediente':
            const ingrediente = await Ingrediente.findById(id).populate('proveedor', '-__v -stock_actual');
            if (!ingrediente) {
                return false;
            }
            // Comprobar que el id de usuario que actualiza es el mismo id del token
            // solo el dueño del ingrediente puede modificar su imagen
            if (infoToken(token).uid.toString() !==  ingrediente.proveedor._id.toString()) {
                console.log('el usuario que actualiza no es el propietario del ingrediente')
                return false;
            }

            const fotoViejaIng = ingrediente.imagen;
            const pathFotoViejaIng = `${path}/${fotoViejaIng}`;
            if (fotoViejaIng && fs.existsSync(pathFotoViejaIng) && fotoViejaIng != 'default_ingrediente.jpg') {
                fs.unlinkSync(pathFotoViejaIng);
            }

            ingrediente.imagen = nombreArchivo;
            await ingrediente.save();

            return true;
            break;

        default:
            return false;
            break;
    }
}

module.exports = { updateImagenes }
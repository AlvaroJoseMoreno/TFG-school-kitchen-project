require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const { updateImagenes } = require('../helpers/updateImagenes');
const fs = require('fs');

const enviarArchivo = async(req, res = response) => {

    const tipo = req.params.tipo; // fotoperfil   evidencia
    const nombreArchivo = req.params.nombrearchivo;
    //console.log(req.params);
    const path = `${process.env.PATH_UPLOAD}${tipo}`;
    let pathArchivo = `${path}/${nombreArchivo}`;
    
    if (!fs.existsSync(pathArchivo)) {
        if (tipo !== 'fotoperfil' && tipo !== 'fotoingrediente') {
            return res.status(400).json({
                ok: false,
                msg: 'El archivo no existe'
            });
        }
        let tipoFile = tipo === 'fotoperfil' ? 'default_picture.jpg' : 'default_ingrediente.jpg';
        pathArchivo = `${path}/${tipoFile}`;
    }

    res.sendFile(pathArchivo);
}

const subirArchivo = async(req, res = repsonse) => {

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
            ok: false,
            msg: 'No se ha enviado archivo',
        });
    }

    if (!req.files.file) {
        return res.status(400).json({
            ok: false,
            msg: `Debe enviarse el archivo como form-data llamado 'file'`,
        });
    }

    const id = req.params.id;
    const tipo = req.params.tipo;

    const files_valids = {
        fotoperfil: ['jpeg', 'jpg', 'png'],
        fotoingrediente: ['jpeg', 'jpg', 'png'],
    }

    if (req.files.file.truncated) {
        return res.status(400).json({
            ok: false,
            msg: `El archivo es demasiado grande, permitido hasta ${process.env.MAXSIZEUPLOAD}MB`
        });
    }

    const File = req.files.file;
    const nombrePartido = File.name.split('.');
    const extension = nombrePartido[nombrePartido.length - 1].toLowerCase();

    switch (tipo) {
        case 'fotoperfil':
            if (!files_valids.fotoperfil.includes(extension)) {
                return res.status(400).json({
                    ok: false,
                    msg: `El tipo de archivo '${extension}' no está permtido (${files_valids.fotoperfil})`
                });
            }
                // Comprobar que solo el usuario cambia su foto de usuario
            break;
        case 'fotoingrediente':
            if (!files_valids.fotoingrediente.includes(extension)) {
                return res.status(400).json({
                    ok: false,
                    msg: `El tipo de archivo '${extension}' no está permtido (${files_valids.fotoingrediente})`
                });
            }
            break;
        default:
            return res.status(400).json({
                ok: false,
                msg: `El tipo de operacion no está permtida`,
                tipoOperacion: tipo
            });
    }

    const path = `${process.env.PATH_UPLOAD}${tipo}`;
    const fileName = `${uuidv4()}.${extension}`;
    const path_file = `${path}/${fileName}`;

    // Use the mv() method to place the file somewhere on your server
    File.mv(path_file, err => {
        if (err) {
            return res.status(400).json({
                ok: false,
                msg: `El archivo no se ha subido con éxito al servidor`
            });
        }

        const token = req.header('x-token');

        updateImagenes(tipo, path, fileName, id, token).then(valor => {
            if (!valor) {
                fs.unlinkSync(path_file);
                return res.status(400).json({
                    ok: false,
                    msg: `No se pudo subir la foto`,
                });
            } else {
                res.json({
                    ok: true,
                    msg: 'subirArchivo',
                    fileName
                });
            }
        }).catch(error => {
            console.log(error);
            fs.unlinkSync(path_file);
            return res.status(400).json({
                ok: false,
                msg: `Error al cargar archivo`,
            });
        });
    });
}

module.exports = { subirArchivo, enviarArchivo }
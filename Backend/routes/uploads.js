/*
Ruta base: /api/upload
*/

const { Router } = require('express');
const { check } = require('express-validator');
const { subirArchivo, enviarArchivo } = require('../controllers/uploads');
const { validarJWT } = require('../middlewares/validar_jwt');
const { validarCampos } = require('../middlewares/validar-campos');
const router = Router();

router.get('/:tipo/:nombrearchivo', [
    validarJWT,
    check('nombrearchivo', 'El nombre del archivo debe ser válido').trim(),
    validarCampos,
], enviarArchivo);

router.post('/:tipo/:id', [
    validarJWT,
    check('id', 'El identificador no es válido').isMongoId(),
    validarCampos,
], subirArchivo);

module.exports = router;
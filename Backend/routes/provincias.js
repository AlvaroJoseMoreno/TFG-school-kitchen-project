const { Router } = require('express');
const { getProvincias, crearProvincia, updateProvincia, borrarProvincia, getProvinciasPorColegio } = require('../controllers/provincias');
const { check } = require('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar_jwt');
const router = Router();

router.get('/', validarJWT, getProvincias);

router.get('/provinciasporcolegio', validarJWT, getProvinciasPorColegio);

router.post('/', [
    validarJWT,
    check('nombre', 'El nombre no puede estar vacío').not().isEmpty(),
    check('codigo', 'El código tiene que existir').not().isEmpty(),
    validarCampos
], crearProvincia);

router.put('/:id', [
    validarJWT,
    check('id', 'El identificador no es válido').isMongoId(),
    validarCampos
], updateProvincia);

router.delete('/:id', [
    validarJWT,
    check('id', 'El identificador no es válido').isMongoId(),
    validarCampos
], borrarProvincia);

module.exports = router;
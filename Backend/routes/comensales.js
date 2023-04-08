const { Router } = require('express');
const { getComensales, crearComensales, borrarComensales, updateComensales } = require('../controllers/comensales');
const { check } = require('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar_jwt');
const router = Router();

router.get('/', [
    validarJWT,
    check('id', 'El id de comensales debe ser válido').optional().isMongoId(),
    check('text', 'La busqueda debe contener texto').optional().trim(),
    validarCampos
], getComensales);

router.post('/', [
    validarJWT,
    check('fecha', 'La fecha es obligatoria').notEmpty(),
    check('fecha', 'La fecha tiene que ser un tipo date').isDate(),
    check('num_comensales', 'El número de comensales debe ser un número').isNumeric(),
    check('num_comensales', 'El número de comensales debe ser mayor que 0').not().isEmpty(),
    check('colegio', 'El colegio es obligatorio').notEmpty(),
    check('colegio', 'El colegio debe ser válido').isMongoId(),
    check('usuario', 'El usuario es obligatorio').notEmpty(),
    check('usuario', 'El usuario que registra los comensales debe ser válido').isMongoId(),
    validarCampos
], crearComensales);

router.put('/:id', [
    validarJWT,
    check('id', 'El identificador no es válido').isMongoId(),
    check('fecha', 'La fecha es obligatoria').notEmpty(),
    check('fecha', 'La fecha tiene que ser un tipo date').isDate(),
    check('num_comensales', 'El número de comensales debe ser un número').isNumeric(),
    check('num_comensales', 'El número de comensales debe ser mayor que 0').not().isEmpty(),
    check('colegio', 'El colegio es obligatorio').notEmpty(),
    check('colegio', 'El colegio debe ser válido').isMongoId(),
    check('usuario', 'El usuario es obligatorio').notEmpty(),
    check('usuario', 'El usuario que registra los comensales debe ser válido').isMongoId(),
    validarCampos
], updateComensales);

router.delete('/:id', [
    validarJWT,
    check('id', 'El identificador no es válido').isMongoId(),
    validarCampos
], borrarComensales);

module.exports = router;
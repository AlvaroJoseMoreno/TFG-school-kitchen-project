const { Router } = require('express');
const { getColegios, crearColegio, updateColegio, borrarColegio } = require('../controllers/colegios');
const { check } = require('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar_jwt');
const router = Router();

router.get('/', [
    validarJWT,
    check('id', 'El id del colegio debe ser válido').optional().isMongoId(),
    check('text', 'La busqueda debe contener texto').optional().trim(),
    validarCampos
], getColegios);

router.post('/', [
    validarJWT,
    check('nombre', 'El nombre no puede estar vacío').not().isEmpty(),
    check('direccion', 'Los colegios deben tener una dirección').not().isEmpty(),
    check('direccion', 'La dirección debe tener como mínimo 20 caracteres').isLength({ min: 20 }),
    check('telefono', 'Los colegios deben tener un telefono').not().isEmpty(),
    check('telefono', 'Los telefonos deben de ser de 9 caracteres').isLength({ min: 9, max: 9 }),
    check('provincia', 'Debe ser un identificador de provincia válido').isMongoId(),
    validarCampos
], crearColegio);

router.put('/:id', [
    validarJWT,
    check('id', 'El identificador no es válido').isMongoId(),
    validarCampos
], updateColegio);

router.delete('/:id', [
    validarJWT,
    check('id', 'El identificador no es válido').isMongoId(),
    validarCampos
], borrarColegio);

module.exports = router;
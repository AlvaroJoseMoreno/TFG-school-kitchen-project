const { Router } = require('express');
const { crearPlato, getPlatos, updatePlato, borrarPlato } = require('../controllers/platos');
const { check } = require('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar_jwt');
const router = Router();

router.get('/', [
    validarJWT,
    check('id', 'El id de ingrediente debe ser válido').optional().isMongoId(),
    check('colegio', 'El id de pedido debe ser válido').optional().isMongoId(),
    check('proveedor', 'El id de proveedor debe ser válido').optional().isMongoId(),
    check('text', 'La busqueda debe contener texto').optional().trim(),
    validarCampos
], getPlatos);

router.post('/', [
    validarJWT,
    check('nombre', 'El nombre es obligatorio').notEmpty(),
    check('nombre', 'El nombre es una cadena de texo').isString(),
    check('categoria', 'La categoría es obligatoria').notEmpty(),
    check('categoria', 'La categoría es una cadena de texo').isString(),
    check('colegio', 'El colegio es obligatorio').notEmpty(),
    check('colegio', 'El colegio debe tener un identificador válido').isMongoId(),
    check('ingredientes', 'Los ingredientes deben ser un array que no este vacío').isArray().notEmpty(),
    check('ingredientes', 'Los ingredientes deben ser un array de identificadores válidos').isArray().isMongoId(),
    check('cantidad_ingredientes', 'La cantidad de ingredientes no debe estar vacía').isArray().notEmpty(),
    check('cantidad_ingredientes', 'La cantidad debe ser un array de números').isArray().isNumeric(),
    validarCampos
], crearPlato);

router.put('/:id', [
    validarJWT,
    check('id', 'El identificador no es válido').isMongoId(),
    check('nombre', 'El nombre es obligatorio').notEmpty(),
    check('nombre', 'El nombre es una cadena de texo').isString(),
    check('categoria', 'La categoría es obligatoria').notEmpty(),
    check('categoria', 'La categoría es una cadena de texo').isString(),
    check('ingredientes', 'Los ingredientes deben ser un array que no este vacío').isArray().notEmpty(),
    check('ingredientes', 'Los ingredientes deben ser un array de identificadores válidos').isArray().isMongoId(),
    check('cantidad_ingredientes', 'La cantidad de ingredientes no debe estar vacía').isArray().notEmpty(),
    check('cantidad_ingredientes', 'La cantidad debe ser un array de números').isArray().isNumeric(),
    validarCampos
], updatePlato);

router.delete('/:id', [
    validarJWT,
    check('id', 'El identificador no es válido').isMongoId(),
    validarCampos
], borrarPlato);

module.exports = router;
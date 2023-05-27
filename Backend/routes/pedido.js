const { Router } = require('express');
const { getPedidos, crearPedidos, borrarPedido, updatePedido, recepcionarPedido } = require('../controllers/pedido');
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
], getPedidos);

router.post('/', [
    validarJWT,
    check('fecha_esperada', 'La fecha es obligatoria').notEmpty(),
    check('fecha_esperada', 'La fecha es y debe ser una fecha válida').isDate(),
    check('proveedor', 'El proveedor es obligatorio').notEmpty(),
    check('proveedor', 'El proveedor debe tener un identificador válido').isMongoId(),
    check('ingredientes', 'Los ingredientes deben ser un array que no este vacío').isArray().notEmpty(),
    check('ingredientes', 'Los ingredientes deben ser un array de identificadores válidos').isArray().isMongoId(),
    check('cantidad', 'La cantidad de ingredientes no debe estar vacía').isArray().notEmpty(),
    check('cantidad', 'La cantidad debe ser un array de números').isArray().isNumeric(),
    check('estado', 'El estado no se puede modificar manualmente').isEmpty(),
    validarCampos
], crearPedidos);

router.put('/:id', [
    validarJWT,
    check('id', 'El id del pedido debe ser válido').isMongoId(),
    check('nombre', 'El nombre no se puede modificar').isEmpty(),
    check('fecha_esperada', 'La fecha es obligatoria').notEmpty(),
    check('fecha_esperada', 'La fecha es y debe ser una fecha válida').isDate(),
    check('proveedor', 'El proveedor de un pedido no se puede modificar').isEmpty(),
    check('ingredientes', 'Los ingredientes deben ser un array que no este vacío').isArray().notEmpty(),
    check('ingredientes', 'Los ingredientes deben ser un array de identificadores válidos').isArray().isMongoId(),
    check('cantidad', 'La cantidad de ingredientes no debe estar vacía').isArray().notEmpty(),
    check('cantidad', 'La cantidad debe ser un array de números').isArray().isNumeric(),
    check('cantidad_recepcionada', 'La cantidad recepcionada no se puede modificar').isEmpty(),
    check('estado', 'El estado no se puede modificar manualmente').isEmpty(),
    validarCampos
], updatePedido);

router.put('/recepcionar/:id', [
    validarJWT,
    check('id', 'El id del pedido debe ser válido').isMongoId(),
    check('cantidad_recepcionada', 'La cantidad recepcionada no se puede modificar').isArray().isNumeric().notEmpty(),
    validarCampos
], recepcionarPedido);

router.delete('/:id', [
    validarJWT,
    check('id', 'El identificador no es válido').isMongoId(),
    validarCampos
], borrarPedido);

module.exports = router;
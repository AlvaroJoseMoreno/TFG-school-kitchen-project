const { Router } = require('express');
const { getMenus, crearMenu, updateMenu, borrarMenu } = require('../controllers/menu');
const { check } = require('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar_jwt');
const router = Router();

router.get('/', [
    validarJWT,
    check('id', 'El id de ingrediente debe ser válido').optional().isMongoId(),
    check('dia', 'El dia debe ser una fecha válida').optional().isDate(),
    check('plato', 'El id del plato debe ser válido').optional().isMongoId(),
    check('tipo', 'El tipo debe ser estándar o alérgicos').optional().trim(),
    check('colegio', 'El id del colegio debe ser válido').optional().isMongoId(),
    validarCampos
], getMenus);

router.post('/', [
    validarJWT,
    check('nombre', 'El nombre es obligatorio y debe ser una cadena de texto').notEmpty().isString(),
    check('dia', 'La dia es obligatorio y debe ser una fecha válida').notEmpty().isDate(),
    check('colegio', 'El colegio debe tener un identificador válido').notEmpty().isMongoId(),
    check('plato1', 'El primer plato debe tener un indentificador válido').notEmpty().isMongoId(),
    check('plato2', 'El segundo plato debe tener un indentificador válido').notEmpty().isMongoId(),
    check('ensalada', 'La ensalada debe tener un indentificador válido').optional().isMongoId(),
    check('postre', 'El postre debe tener un identificador válido').notEmpty().isMongoId(),
    validarCampos
], crearMenu);

router.put('/:id', [
    validarJWT,
    check('nombre', 'El nombre es obligatorio').notEmpty(),
    check('nombre', 'El nombre es una cadena de texo').isString(),
    check('dia', 'La dia es obligatorip').notEmpty(),
    check('dia', 'La dia es y debe ser una fecha válida').isDate(),
    check('colegio', 'El colegio debe tener un identificador válido').notEmpty().isMongoId(),
    check('plato1', 'El primer plato debe tener un indentificador válido').notEmpty().isMongoId(),
    check('plato2', 'El segundo plato debe tener un indentificador válido').notEmpty().isMongoId(),
    check('ensalada', 'La ensalada debe tener un indentificador válido').optional().isMongoId(),
    check('postre', 'El postre debe tener un identificador válido').notEmpty().isMongoId(),
    validarCampos
], updateMenu);

router.delete('/:id', [
    validarJWT,
    check('id', 'El identificador no es válido').isMongoId(),
    validarCampos
], borrarMenu);

module.exports = router;
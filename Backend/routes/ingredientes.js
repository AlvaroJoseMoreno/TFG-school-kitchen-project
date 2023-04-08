const { Router } = require('express');
const { getIngredientes, crearIngredientes, updateIngredientes, borrarIngredientes } = require('../controllers/ingredientes');
const { check } = require('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar_jwt');
const router = Router();

router.get('/', [
    validarJWT,
    check('id', 'El id de ingrediente debe ser válido').optional().isMongoId(),
    check('text', 'La busqueda debe contener texto').optional().trim(),
    validarCampos
], getIngredientes);

router.post('/', [
    validarJWT,
    check('nombre', 'El nombre es obligatorio').notEmpty(),
    check('unidad_medida', 'La unidad de medida es obligatoria').not().isEmpty(),
    check('proveedor', 'El proveedor es obligatorio').notEmpty(),
    check('precio', 'El precio es obligatorio').notEmpty(),
    check('precio', 'El precio debe ser un número').isNumeric(),
    check('proveedor', 'El proveedor debe tener un identificador válido').isMongoId(),
    validarCampos
], crearIngredientes);

router.put('/:id', [
    validarJWT,
    check('nombre', 'El nombre es obligatorio').notEmpty(),
    check('unidad_medida', 'La unidad de medida es obligatoria').not().isEmpty(),
    check('proveedor', 'El proveedor es obligatorio').notEmpty(),
    check('precio', 'El precio es obligatorio').notEmpty(),
    check('precio', 'El precio debe ser un número').isNumeric(),
    check('proveedor', 'El proveedor debe tener un identificador válido').isMongoId(),
    validarCampos
], updateIngredientes);

router.delete('/:id', [
    validarJWT,
    check('id', 'El identificador no es válido').isMongoId(),
    validarCampos
], borrarIngredientes);

module.exports = router;
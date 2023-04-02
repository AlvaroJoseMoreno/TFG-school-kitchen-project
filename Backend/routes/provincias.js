const { Router } = require('express');
const { getProvincias, crearProvincia, updateProvincia, borrarProvincia } = require('../controllers/provincias');
const { check } = require('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');
//const { validateJWT } = require('../middleware/validate_jwt');
const router = Router();

router.get('/', [
], getProvincias);

router.post('/', [
    check('nombre', 'El nombre no puede estar vacío').not().isEmpty(),
    check('codigo', 'El código tiene que existir').not().isEmpty(),
    validarCampos
], crearProvincia);

router.put('/:id', [
    check('id', 'El identificador no es válido').isMongoId(),
    validarCampos
], updateProvincia);

router.delete('/:id', [
    check('id', 'El identificador no es válido').isMongoId(),
    validarCampos
], borrarProvincia);

module.exports = router;
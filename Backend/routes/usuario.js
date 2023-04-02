const { Router } = require('express');
const { getUsuarios, crearAdmin } = require('../controllers/usuario');
const { check } = require('express-validator');
const { validar_rol } = require('../middlewares/validar_rol');
const { validarCampos } = require('../middlewares/validar-campos');
//const { validateJWT } = require('../middleware/validate_jwt');
//const { validate_rol } = require('../middleware/validate_rol');
const router = Router();

router.get('/', [
    //validateJWT,
    //check('id', 'El id de usuario debe ser válido').optional().isMongoId(),
    //check('since', 'El desde debe ser un número').optional().isNumeric(),
    //check('text', 'La busqueda debe contener texto').optional().trim(),
    //validarCampos
], getUsuarios);

router.post('/admin', [
    validar_rol,
    check('email', 'El argumento email es obligatorio').not().isEmpty(),
    check('email', 'El email debe ser un email válido, ejemplo: xxxxxx@xxxx.xx').isEmail(),
    validarCampos
], crearAdmin);

/*router.post('/super', [
    validar_rol
]);

router.post('/prov', [
    validar_rol
]);

router.post('/cocinero', [
    validar_rol
]);*/

module.exports = router;
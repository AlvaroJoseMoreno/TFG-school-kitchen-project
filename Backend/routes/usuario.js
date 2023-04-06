const { Router } = require('express');
const { getUsuarios, crearAdmin } = require('../controllers/usuario');
const { check } = require('express-validator');
const { validar_rol } = require('../middlewares/validar_rol');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar_jwt');
const { validar_tipo_proveedor } = require('../middlewares/validar_tipo_proveedor');
const router = Router();

router.get('/', [
    validarJWT,
    check('id', 'El id de usuario debe ser válido').optional().isMongoId(),
    check('text', 'La busqueda debe contener texto').optional().trim(),
    validarCampos
], getUsuarios);

router.post('/admin', [
    validarJWT,
    validar_rol,
    check('email', 'El argumento email es obligatorio').not().isEmpty(),
    check('email', 'El email debe ser un email válido, ejemplo: xxxxxx@xxxx.xx').isEmail(),
    check('password', 'El argumento password es obligatorio').not().isEmpty(),
    check('rol', 'El argumento rol es obligatorio').not().isEmpty(),
    check('nombre', 'El argumento nombre es obligatorio').not().isEmpty(),
    //check('colegio', 'El argumento colegio es obligatorio').not().isEmpty(),
    validarCampos
], crearAdmin);

router.post('/super', [
    validar_rol
]);

router.post('/prov', [
    validar_rol,
    validar_tipo_proveedor
]);

router.post('/cocinero', [
    validar_rol
]);

module.exports = router;
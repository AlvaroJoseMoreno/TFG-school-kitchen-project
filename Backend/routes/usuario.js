const { Router } = require('express');
const { getUsuarios, crearAdmin, crearSuper, crearProveedor, crearCocinero, borrarUsuario, updateUsuario } = require('../controllers/usuario');
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
    check('email', 'El argumento email es obligatorio').not().isEmpty(),
    check('email', 'El email debe ser un email válido, ejemplo: xxxxxx@xxxx.xx').isEmail(),
    check('password', 'El argumento password es obligatorio').not().isEmpty(),
    check('rol', 'El argumento rol es obligatorio').not().isEmpty(),
    check('nombre', 'El argumento nombre es obligatorio').not().isEmpty(),
    check('tipo_proveedor', 'El argumento tipo proveedor debe estar vacío').isEmpty(),
    validar_rol,
    validarCampos
], crearAdmin);

router.post('/super', [
    validarJWT,
    check('email', 'El argumento email es obligatorio').not().isEmpty(),
    check('email', 'El email debe ser un email válido, ejemplo: xxxxxx@xxxx.xx').isEmail(),
    check('password', 'El argumento password es obligatorio').not().isEmpty(),
    check('rol', 'El argumento rol es obligatorio').not().isEmpty(),
    check('nombre', 'El argumento nombre es obligatorio').not().isEmpty(),
    check('colegio', 'El argumento colegio es obligatorio').not().isEmpty(),
    check('colegio', 'El colegio debe ser un identificador válido').isMongoId(),
    check('tipo_proveedor', 'El argumento tipo proveedor debe estar vacío').isEmpty(),
    validar_rol,
    validarCampos
], crearSuper);

router.post('/proveedor', [
    validarJWT,
    check('email', 'El argumento email es obligatorio').not().isEmpty(),
    check('email', 'El email debe ser un email válido, ejemplo: xxxxxx@xxxx.xx').isEmail(),
    check('password', 'El argumento password es obligatorio').not().isEmpty(),
    check('rol', 'El argumento rol es obligatorio').not().isEmpty(),
    check('nombre', 'El argumento nombre es obligatorio').not().isEmpty(),
    check('colegio', 'El argumento colegio es obligatorio').not().isEmpty(),
    check('colegio', 'El colegio debe ser un identificador válido').isMongoId(),
    check('tipo_proveedor', 'El argumento tipo proveedor es obligatorio').not().isEmpty(),
    validar_tipo_proveedor,
    validar_rol,
    validarCampos
], crearProveedor);

router.post('/cocinero', [
    validarJWT,
    check('email', 'El argumento email es obligatorio').not().isEmpty(),
    check('email', 'El email debe ser un email válido, ejemplo: xxxxxx@xxxx.xx').isEmail(),
    check('password', 'El argumento password es obligatorio').not().isEmpty(),
    check('rol', 'El argumento rol es obligatorio').not().isEmpty(),
    check('nombre', 'El argumento nombre es obligatorio').not().isEmpty(),
    check('colegio', 'El argumento colegio es obligatorio').not().isEmpty(),
    check('colegio', 'El colegio debe ser un identificador válido').isMongoId(),
    validar_rol,
    validarCampos
], crearCocinero);

router.put('/:id', [
    validarJWT,
    check('id', 'El identificador no es válido').isMongoId(),
    check('email', 'El argumento email es obligatorio').not().isEmpty(),
    check('email', 'El email debe ser un email válido, ejemplo: xxxxxx@xxxx.xx').isEmail(),
    check('password', 'El password no se modifica aquí').isEmpty(),
    check('rol', 'El argumento rol es obligatorio').not().isEmpty(),
    check('nombre', 'El argumento nombre es obligatorio').not().isEmpty(),
    check('colegio', 'El argumento colegio es obligatorio').not().isEmpty(),
    check('colegio', 'El colegio debe ser un identificador válido').isMongoId(),
    validar_tipo_proveedor,
    validarCampos
], updateUsuario);

router.delete('/:id', [
    validarJWT,
    check('id', 'El identificador no es válido').isMongoId(),
    validarCampos
], borrarUsuario);

module.exports = router;
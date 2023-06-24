const { Router } = require('express');
const { token, login, verifyLinkConfirmAcount, cambiarContraseña, sendRecovery } = require('../controllers/auth');
const { check } = require('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');

const router = Router();

router.get('/token', [
    check('x-token', 'El argumento x-token es obligatorio').not().isEmpty(),
    validarCampos,
], token);

router.post('/', [
    check('email', 'El argumento email es obligatorio').not().isEmpty(),
    check('password', 'El argumento pasword es obligatorio').not().isEmpty(),
    validarCampos,
], login);

router.get('/validar/:code', verifyLinkConfirmAcount);

router.post('/sendrecovery', [
    check('email', 'El argumento email es obligatorio').not().isEmpty().isEmail(),
    validarCampos,
], sendRecovery);

router.get('/validar/:code', verifyLinkConfirmAcount);

router.get('/recovery/:code', verifyLinkConfirmAcount);

router.put('/cambiarpwd/:code', [
    check('password', 'El argumento pasword es obligatorio').not().isEmpty(),
    check('repeatPwd', 'El argumento repeatPwd es obligatorio').not().isEmpty(),
    validarCampos,
], cambiarContraseña);

module.exports = router;
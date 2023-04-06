const { response } = require('express');
const roles_permitidos = ['CARNE', 'PESCADO', 'FRUTAVERDURA', 'LACTEOS', 'ESPECIAS', 'DULCES'];

const validar_tipo_proveedor = (req, res = response, next) => {
    const rol = req.body.rol;
    if (rol && !roles_permitidos.includes(rol)) {
        return res.status(400).json({
            ok: false,
            msg: 'Rol no valido, permitidos: ROL_COCINERO, ROL_PROVEEDOR, ROL_SUPERVISOR, ROL_ADMIN'
        });
    }
    next();
}

module.exports = { validar_tipo_proveedor }
const { response } = require('express');
const roles_permitidos = ['CARNE', 'PESCADO', 'FRUTAVERDURA', 'LACTEOS', 'ESPECIAS', 'DULCES'];

const validar_tipo_proveedor = (req, res = response, next) => {
    const tipo_prov = req.body.tipo_proveedor;
    if (tipo_prov && !roles_permitidos.includes(tipo_prov)) {
        return res.status(400).json({
            ok: false,
            msg: 'Tipo no valido, permitidos: CARNE, PESCADO, FRUTAVERDURA, LACTEOS, ESPECIAS, DULCES'
        });
    }
    next();
}

module.exports = { validar_tipo_proveedor }
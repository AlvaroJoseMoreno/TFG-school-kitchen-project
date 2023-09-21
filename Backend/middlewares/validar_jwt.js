const jwt = require('jsonwebtoken');

const validarJWT = (req, res, next) => {
    const token = req.header('x-token') || req.query.token || req.params.token;

    if (!token) {
        return res.status(400).json({
            ok: false,
            msg: 'Authorization token missing'
        });
    }

    try {
        const { uid, rol } = jwt.verify(token, process.env.JWTSECRET);

        req.uidToken = uid;
        req.rolToken = rol;

        next();
    } catch (err) {
        console.log(err);
        return res.status(400).json({
            ok: false,
            msg: 'Token not valid'
        })
    }
}

module.exports = { validarJWT }
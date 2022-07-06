const jwt = require("jsonwebtoken");
const knex = require('../bancodedados/conexao');

async function authenticated(req, res, next) {
    const { authorization } = req.headers;

    if (!authorization) {
        return res.status(400).json('Acesso negado');
    }

    const token = authorization.replace("Bearer ", "");

    try {
        
        const { id } = jwt.verify(token, process.env.SENHA_JWT);
        const usuario = await knex('usuarios').where({ id }).first();
        req.usuario = { ...usuario };

        next();
    }
    catch (error) {
        return res.status(400).json({ mensagem: error.message });
    }
}

module.exports = {
    authenticated
}
const knex = require('./../bancodedados/conexao');
const { schemaLoginUsuario } =require('../validacoes/schemaUsuario');
const securePassword = require('secure-password');
const jwt = require('jsonwebtoken');
const jwt_secret = require('../jwt_secret');

const pwd = securePassword();

const fazerLogin = async (req, res) => {
  const { email, senha} = req.body;

  try{
    await schemaLoginUsuario.validate(req.body);

    const usuario = await knex('usuarios').where('email', email).first();

    if(!usuario){
      return res.status(400).json('Usuário não encontrado!');
    }

    const verificarSenha = await pwd.verify(Buffer.from(senha), Buffer.from(usuario.senha, 'hex'));

    switch (verificarSenha) {
      case securePassword.INVALID_UNRECOGNIZED_HASH:
      case securePassword.INVALID:
        return res.status(400).json('mensagem: email  ou senha incorreto');
      case securePassword.VALID:
        break;
      case securePassword.VALID_NEEDS_REHASH:
        try {
          const hash = (await pwd.hash(Buffer.from(senha))).toString('hex');
          await knex('usuarios').update({senha: hash, email: email}).where('id', id);
        } catch {
        }
      break;
    }

    const token = jwt.sign({
      id: usuario.id,
      nome: usuario.nome
    }, jwt_secret, {expiresIn: '2h'}
   );

   return res.status(200).json({
    usuario: {
      nome: usuario.nome,
      email: usuario.email,
      cpf: usuario.cpf,
      telefone: usuario.telefone
    },
    token
   });

  } catch(error) {
    return res.status(400).json(error.message);
  }
}

module.exports = { fazerLogin };
const knex = require('./../bancodedados/conexao');
const securePassword = require('secure-password');
const schemaUsuario = require('../validacoes/schemaUsuario');

const pwd = securePassword();

const criarUsuario = async (req, res) => {
  const { nome, senha, email, telefone, cpf } = req.body;

  try {
    await schemaUsuario.schemaCadastroUsuario.validate(req.body);

    const buscarEmail = await knex('usuarios').where('email', email).first();

    if (buscarEmail) {
      return res.status(404).json('O email já está em uso.');
    }

  } catch (error) {
    return res.status(400).json(error.message);
  }

  try {
    const hash = (await pwd.hash(Buffer.from(senha))).toString('hex');

    const novoCliente = await knex('usuarios').insert({ nome, senha: hash, email, telefone, cpf });

    if (!novoCliente) {
      return res.status(400).json('Não foi possível cadastrar o novo cliente.');
    }

    return res.status(200).json('Usuário cadastrado com sucesso');
  } catch (error) {
    return res.status(400).json(error.message);
  }
}

module.exports = { criarUsuario };
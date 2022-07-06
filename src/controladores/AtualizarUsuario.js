const knex = require('../bancodedados/conexao');
const securePassword = require('secure-password');
const { schemaAtualizarUsuario } = require('../validacoes/schemaUsuario');
const pwd = securePassword();
const { errorCampo, errorUser, errorSenha, errorEmail, errorCpf, errorTelefone, errorAtt, userCode } = require('./../Helper/codes');

const atualizarPerfilUsuario = async (req, res) => {
    const { nome, email, senha, cpf, telefone } = req.body;
    const { id } = req.usuario;
    let senhaCriptografada = "";

    if (!nome && !email && !senha && !cpf && !telefone) {
        return res.status(404).json({ mensagem: 'É obrigatório informar ao menos um campo para atualização!', code: errorCampo });
    }

    try {
        await schemaAtualizarUsuario.validate(req.body);

        const existeUsuario = await knex('usuarios').where({ id }).first();

        if (!existeUsuario) {
            return res.status(404).json({ mensagem: 'Usuário não encontrado.', code: errorUser });
        };

        if (senha) {
            if (senha < 4) {
                return res.status(404).json({ mensagem: 'A senha deve conter, no mínimo, 4 caracteres', code: errorSenha });
            }

            senhaCriptografada = (await pwd.hash(Buffer.from(senha))).toString('hex');
        };


        if (email !== req.usuario.email) {
            const existeEmailUsuario = await knex('usuarios').where({ email }).first();

            if (existeEmailUsuario) {
                return res.status(404).json({ mensagem: 'O Email já existe', code: errorEmail });
            }
        };

        if (cpf !== req.usuario.cpf) {
            const existeCpfUsuario = await knex('usuarios').where({ cpf }).first();

            if (existeCpfUsuario) {
                return res.status(404).json({ mensagem: 'O CPF já existe', code: errorCpf });
            }
        };

        if (telefone && telefone !== req.usuario.telefone) {
            const existeTelefoneUsuario = await knex('usuarios').where({ telefone }).first();

            if (existeTelefoneUsuario) {
                return res.status(404).json({ mensagem: 'O telefone já existe', code: errorTelefone });
            }
        };

        const usuarioAtualizado = await knex('usuarios').where({ id }).update({ nome, email, senha: senhaCriptografada, cpf, telefone });

        if (!usuarioAtualizado) {
            return res.status(400).json({ mensagem: 'Não foi possível atualizar o perfil do usuário.', code: errorAtt });
        }

        return res.status(200).json({ mensagem: 'Usuário atualizado com sucesso!', code: userCode });
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

module.exports = { atualizarPerfilUsuario };
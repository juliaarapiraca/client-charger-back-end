const knex = require('../bancodedados/conexao');
const schemaAtualizar = require('../validacoes/schemaCliente');
const {
  userCode, NomeCode, EmailCode, CPFCode, telefoneCode
} = require("./../Helper/codes");

const listarClientes = async (req, res) => {
  try {
    const lista = await knex('clientes').returning('nome', 'email', 'telefone', 'cpf', 'status');

    if (!lista) {
      return res.status(400).json('Não foi possível encontrar a listagem de clientes.');
    }

    return res.status(200).json(lista);
  } catch (error) {
    return res.status(400).json(error.message);
  }
}

const detalharCliente = async (req, res) => {

  const { id } = req.params;

  try {
    const buscarCliente = await knex('clientes').where({ id }).first();

    if (!buscarCliente) {
      return res.status(400).json('Não foi possível localizar o cliente.');
    }
  } catch (error) {
    return res.status(400).json(error.message);
  };

  try {
    const detalharCliente = await knex('clientes')
      .where({ id: id })
      .first()
      .select(
        'nome',
        'email',
        'cpf',
        'telefone',
        'cep',
        'logradouro',
        'complemento',
        'bairro',
        'cidade',
        'estado'
      );

    if (!detalharCliente) {
      return res.status(400).json('Não foi possível detalhar o cliente.');
    }

    return res.status(202).json(detalharCliente);
  } catch (error) {
    return res.status(400).json(error.message);
  }
}

const atualizarCliente = async (req, res) => {
  const {
    nome, email, cpf, telefone,
    cep, logradouro, bairro, cidade, estado, status, complemento
  } = req.body;

  const { id } = req.params;
  const { usuario } = req;

  try {
    await schemaAtualizar.schemaAtualizarCliente.validate(req.body);

    const buscarCliente = await knex('clientes').where({ id }).first();

    if (!buscarCliente) {
      return res.status(400).json('Não foi possível localizar o cliente.');
    }

  } catch (error) {
    return res.status(400).json(error.message);
  }

  try {
    const emailInformado = await knex('clientes').where({ email }).where('id', '!=', id);

    if (emailInformado.length) {
      return res.status(400).json({ messagem: 'Email já cadastrado!', code: EmailCode });
    }

    const cpfInformado = await knex('clientes').where({ cpf }).where('id', '!=', id);

    if (cpfInformado.length) {
      return res.status(400).json({ messagem: 'Cpf já cadastrado!', code: CPFCode });
    }

  } catch (error) {
    return res.status(400).json(error.message);
  }

  try {
    await schemaAtualizar.schemaAtualizarCliente.validate(req.body);
    /* return res.status(203).json(req.body); */
    const atualizarCliente = await knex('clientes').update({ nome, email, cpf, telefone, cep, logradouro, bairro, cidade, estado, status, complemento }).where({ id });

    if (!atualizarCliente) {
      return res.status(400).json('Não foi possível atualizar o cliente.');
    }

    return res.status(200).json('Cliente atualizado com sucesso.');
  } catch (error) {
    return res.status(400).json(error.message);
  }
}

const cadastrarCliente = async (req, res) => {
  const { endereco: logradouro, uf: estado, ...cliente } = req.body;
  const { usuario } = req;
  cliente.logradouro = logradouro;
  cliente.estado = estado;
  cliente.id_usuario = usuario.id;
  const { nome, email, cpf, telefone } = cliente;

  if (!nome) {
    return res.status(404).json({ mensagem: "O campo nome é obrigatório", code: NomeCode, code: NomeCode });
  }

  if (!email) {
    return res.status(404).json({ mensagem: "O campo email é obrigatório", code: EmailCode });
  }

  if (!cpf) {
    return res.status(404).json({ mensagem: "O campo cpf é obrigatório", code: CPFCode });
  }

  if (!telefone) {
    return res.status(404).json({ mensagem: "O campo telefone é obrigatório", code: telefoneCode });
  }

  try {
    const [clienteComEmailIgual] = await knex("clientes").where("email", email);

    if (clienteComEmailIgual) {
      return res.status(400).json({ mensagem: "O email já existe", code: EmailCode });
    }

    const [clienteComCpfIgual] = await knex("clientes").where("cpf", cpf);

    if (clienteComCpfIgual) {
      return res.status(400).json({ mensagem: "O cpf já existe", code: CPFCode });
    }

    const respostaInsertCliente = await knex("clientes").insert(cliente);

    if (respostaInsertCliente.rowCount == 0) {
      return res.status(400).json({ mensagem: "O usuário não foi cadastrado.", code: userCode });
    }

    return res.status(200).json({ mensagem: "O usuario foi cadastrado com sucesso!" });

  } catch (error) {
    return res.status(400).json({ mensagem: error.message, code: 0 });
  }
}

const ordenarBuscarClientes = async (req, res) => {
  const { nome, cpf, email } = req.body;
  const { usuario } = req;

  if (!nome && !email && !cpf) {
    return res.status(400).json('Ao menos um campo de ordenação deve ser informado!');
  }

  try {
    await schemaAtualizar.schemaOrdernarBuscar.validate(req.body);

    const buscarCPF = await knex('clientes').where(cpf).first();

    const buscarEmail = await knex('clientes').where(email).first();

    if (!buscarCPF && !buscarEmail) {
      return res.status(404).json('Nenhum resultado do cliente desejado!');
    }
  } catch (error) {
    return res.status(400).json(error.message);
  }

  try {
    const ordenacaoClientes = await knex('clientes').where(nome).orderBy('nome');

    if (!ordenacaoClientes) {
      return res.status(400).json('Não foi possível ordenar pelo nome do cliente');
    }

    if (cpf) {
      const buscarClientesCPF = await knex('clientes').where({ id_usuario: usuario.id, cpf });

      if (buscarClientesCPF) {
        return res.status(200).json(buscarClientesCPF);
      }
    }

    if (email) {
      const buscarClientesEmail = await knex('clientes').where({ id_usuario: usuario.id, email });

      if (buscarClientesEmail) {
        return res.status(200).json(buscarClientesEmail);
      }
    }

    return res.status(200).json(ordenacaoClientes);
  } catch (error) {
    return res.status(400).json(error.message);
  }
}

const verTodosClientes = async (req, res) => {
  const { usuario } = req;

  if (!usuario) {
    return res.status(401).json('Usuário não autorizado!');
  }

  try {
    const clientesInadimplente = await knex('clientes')
      .where({ status: 0 });

    if (!clientesInadimplente) {
      return res.status(404).json('Não foi possível fazer a listagem dos clientes inadimplentes!');
    }

    const clientesEmDia = await knex('clientes').where({ status: 1 });

    if (!clientesEmDia) {
      return res.status(404).json('Não foi possível fazer a listagem dos clientes em dia!');
    }

    return res.status(200).json({ clientesInadimplente, clientesEmDia });
  } catch (error) {
    return res.status(400).json(error.message);
  }
}

module.exports = {
  cadastrarCliente,
  listarClientes,
  detalharCliente,
  atualizarCliente,
  ordenarBuscarClientes,
  verTodosClientes
}
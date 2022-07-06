const knex = require('../bancodedados/conexao');
const schema = require('../validacoes/schemaCobrancas');

const cadastrarCobranca = async (req, res) => {
  const { descricao, status, valor, vencimento, id_cliente } = req.body;

  if (!descricao || !status || !valor || !vencimento || !id_cliente) {
    return res.status(404).json('Todos os campos são obrigatórios');
  };

  try {
    const buscarCliente = await knex('clientes').where({ id: id_cliente }).first();

    if (!buscarCliente) {
      return res.status(404).json('Cliente não encontrado!');
    }
  } catch (error) {
    return res.status(400).json(error.message);
  }

  try {
    await schema.schemaCadastroCobranca.validate(req.body);

    const novaCobranca = await knex('cobranças').insert({ descricao, status, valor, vencimento, id_cliente });

    if (!novaCobranca) {
      return res.status(400).json('Não foi possível cadastrar a cobrança.');
    }

    return res.status(200).json('Cobrança cadastrada com sucesso!');

  } catch (error) {
    return res.status(400).json(error.message);
  }

};

const listarCobrancas = async (req, res) => {
  try {
    const cobrancas = await knex('cobranças as cb')
      .join('clientes as cl', 'cl.id', 'cb.id_cliente')
      .select('cl.nome', 'cb.id', 'cb.descricao', 'cb.status', 'cb.valor', 'cb.vencimento');

    if (!cobrancas) {
      return res.status(404).json('Não há cobranças cadastradas.');
    };

    return res.status(200).json(cobrancas);
  } catch (error) {
    return res.status(400).json(error.message);
  };
};

const listarCobrancasPorCliente = async (req, res) => {
  const { id } = req.params;

  try {
    const cobrancas = await knex('cobranças').where({ id_cliente: id }).first();

    if (!cobrancas) {
      return res.status(404).json('Não há cobranças cadastradas');
    };
    return res.status(200).json(cobranças);
  } catch (error) {
    return res.status(400).json(error.message);
  }
};

const buscarCobrancas = async (req, res) => {
  const { nome } = req.body;
  const { id } = req.params;

  if (!nome && !id) {
    return res.status(400).json('O nome do cliente ou id da cobrança deverá ser informado!');
  }

  try {

    if (nome) {
      const buscarCobrancas = await knex('cobranças as cb')
        .join('clientes as cl', 'cb.id_cliente', 'cl.id')
        .select('cb.*', 'cl.nome')
        .where('cl.nome', nome);

      if (!buscarCobrancas) {
        return res.status(400).json('Não foi possível listar as cobranças do Cliente')
      }

      return res.status(200).json(buscarCobrancas);
    }

    const listarCobrancas = await knex('cobranças as cb')
      .join('clientes as cl', 'cb.id_cliente', 'cl.id')
      .select('cb.*', 'cl.nome')
      .where('cb.id', id);


    if (!listarCobrancas) {
      return res.status(400).json('Não foi possível listar as cobranças do Cliente');
    }

    return res.status(200).json(listarCobrancas)

  } catch (error) {
    return res.status(400).json(error.message);
  }
};

const editarCobrancas = async (req, res) => {
  const { descricao, status, valor, vencimento } = req.body;
  const { id } = req.params;
  const { usuario } = req;

  if (!usuario) {
    return res.status(401).json('Usuário não autenticado!');
  }

  try {

    const buscarCobranca = await knex('cobranças').where({ id }).first();

    if (!buscarCobranca) {
      return res.status(400).json('Não foi possível localizar a cobrança a ser editada');
    }

    await schema.schemaEditarCobrancas.validate(req.body);

    const editarCobranca = await knex('cobranças').update({ descricao, status, valor, vencimento }).where({ id });

    if (!editarCobranca) {
      return res.status(400).json('Não foi possível editar a cobrança!');
    }

    return res.status(200).json('Cobrança atualizada com sucesso!');
  } catch (error) {
    return res.status(400).json(error.message);
  }
};

const apagarCobranca = async (req, res) => {
  const { id } = req.params;

  try {
    const cobranca = await knex('cobranças').where({ id }).first();

    if (!cobranca) {
      return res.status(404).json('Cobrança não encontrada.');
    }

    const { status, vencimento } = cobranca;

    if (status === 'Paga' || vencimento.getTime() < Date.now()) {
      return res
        .status(404)
        .json('Cobrança paga ou com vencimento anterior a data atual não pode ser excluída.');
    };

    const cobrancaExcluida = await knex('cobranças').where({ id }).del();

    if (!cobrancaExcluida) {
      return res.status(404).json('Não foi possível excluir cobrança.');
    };

    return res.status(202).json('Cobrança excluída com sucesso.');
  } catch (error) {
    return res.status(400).json(error.message);
  };
};

const cardTotalPagas = async (req, res) => {
  const { usuario } = req;

  if (!usuario) {
    return res.status(401).json('Usuário não autenticado!');
  }

  try {
    const valorTotalPago = await knex('cobranças')
      .sum('valor as totalPago')
      .where({ status: 'Paga' })
      .first();

    if (!valorTotalPago) {
      return res.status(404).json('Não foi possível somar as cobranças pagas!');
    }

    const quantidadeClientesPago = await knex('clientes')
      .where({ status: 1 })
      .count('* as clientesPago')
      .first();

    if (!quantidadeClientesPago) {
      return res.status(404).json('Não foi possível somar a quantidade clientes em dia!');
    }

    const quantidadeCobrancasPagas = await knex('cobranças')
      .where({ status: 'Paga' })
      .count('* as contaPaga')
      .first();

    if (!quantidadeCobrancasPagas) {
      return res.status(404).json('Não foi possível somar a quantidade cobranças pagas!');
    }

    const totalPago = {
      valor: Number(valorTotalPago.totalPago),
      clientes: Number(quantidadeClientesPago.clientesPago),
      cobrancas: Number(quantidadeCobrancasPagas.contaPaga)
    };

    return res.status(200).json(totalPago);
  } catch (error) {
    return res.status(400).json(error.message);
  }
};

const cardTotalVencida = async (req, res) => {
  const { usuario } = req;

  if (!usuario) {
    return res.status(401).json('Usuário não autenticado!');
  }

  try {
    const valorTotalVencida = await knex('cobranças')
      .sum('valor as totalVencido')
      .where({ status: 'Pendente' })
      .andWhere(function () {
        this.where('vencimento', '<', new Date());
      })
      .first();

    if (!valorTotalVencida) {
      return res.status(404).json('Não foi possível somar as cobranças vencidas!');
    }
    
    const quantidadeInadimplentes = await knex('clientes')
      .where({ status: 0 })
      .count('* as clientesInadimplentes')
      .first();

    if (!quantidadeInadimplentes) {
      return res.status(404).json('Não foi possível somar a quantidade de clientes inadimplentes!');
    }
    
    const quantidadeCobrancasVencidas = await knex('cobranças')
      .where({ status: 'Pendente' })
      .andWhere(function () {
        this.where('vencimento', '<', new Date());
      })
      .count('* as contasVencidas')
      .first();

    if (!quantidadeCobrancasVencidas) {
      return res.status(404).json('Não foi possível somar a quantidade cobranças vencidas!');
    }

    const totalVencida = {
      valor: Number(valorTotalVencida.totalVencido),
      clientes: Number(quantidadeInadimplentes.clientesInadimplentes),
      cobrancas: Number(quantidadeCobrancasVencidas.contasVencidas)
    };

    return res.status(200).json(totalVencida)
  } catch (error) {
    return res.status(400).json(error.message)
  }
};

const cardTotalPrevista = async (req, res) => {
  const { usuario } = req;

  if (!usuario) {
    return res.status(401).json('Usuário não autenticado!');
  }

  try {
    const valorTotalPrevisto = await knex('cobranças')
      .sum('valor as totalPrevisto')
      .where({ status: 'Pendente' })
      .andWhere(function () {
        this.where('vencimento', '>=', new Date())
      })
      .first();

    if (!valorTotalPrevisto) {
      return res.status(404).json('Não foi possível somar as cobranças pendentes!');
    }

    const quantidadeClienteAPagar = await knex('clientes')
      .where({ status: 0 })
      .count('* as clientesAPagar')
      .first();

    if (!quantidadeClienteAPagar) {
      return res.status(404).json('Não foi possível somar a quantidade de clientes inadimplentes!');
    }

    const quantidadeCobrancasPrevista = await knex('cobranças')
      .where({ status: 'Pendente' })
      .andWhere(function () {
        this.where('vencimento', '>=', new Date())
      })
      .count('* as contasPrevistas')
      .first();

    if (!quantidadeCobrancasPrevista) {
      return res.status(404).json('Não foi possível somar a quantidade cobranças vencidas!');
    }

    const totalPrevista = {
      valor: Number(valorTotalPrevisto.totalPrevisto),
      clientes: Number(quantidadeClienteAPagar.clientesAPagar),
      cobrancas: Number(quantidadeCobrancasPrevista.contasPrevistas)
    };

    return res.status(200).json(totalPrevista)
  } catch (error) {
    return res.status(400).json(error.message)
  }
};

const cobrancasVencidas = async (req, res) => {
  const { usuario } = req;

  if (!usuario) {
    return res.status(401).json('Usuário não autorizado!');
  }

  try {
    const cobrancasVencidas = await knex('cobranças as cb')
      .join('clientes as cl', 'cl.id', 'cb.id_cliente')
      .select(
        'cl.id as id_cliente',
        'cl.nome',
        'cb.id as id_cobranca',
        'cb.descricao',
        'cb.status',
        'cb.valor',
        'cb.vencimento'
      )
      .whereNot('cb.status', 'Paga')
      .andWhere(function () {
        this.where('vencimento', '<', new Date());
      });

    if (!cobrancasVencidas) {
      return res.status(404).json('Não foi possível fazer a listagem das cobranças vencidas!');
    }

    return res.status(200).json(cobrancasVencidas);
  } catch (error) {
    return res.status(400).json(error.message);
  }
};

const cobrancasPrevistas = async (req, res) => {
  try {
    const cobrancasPrevistas = await knex('cobranças as cb')
      .join('clientes as cl', 'cl.id', 'cb.id_cliente')
      .select(
        'cl.id as id_cliente',
        'cl.nome',
        'cb.id as id_cobranca',
        'cb.descricao',
        'cb.status',
        'cb.valor',
        'cb.vencimento'
      )
      .whereNot('cb.status', 'Paga')
      .andWhere(function () {
        this.where('cb.vencimento', '>=', new Date());
      });

    if (!cobrancasPrevistas) {
      return res.status(404).json('Não foi possível fazer a listagem das cobranças previstas!');
    }

    return res.status(200).json(cobrancasPrevistas);
  } catch (error) {
    return res.status(400).json(error.message);
  }
};

const cobrancasPagas = async (req, res) => {
  const { usuario } = req;

  if (!usuario) {
    return res.status(401).json('Usuário não autorizado!');
  }

  try {
    const cobrancasPagas = await knex('cobranças as cb')
      .join('clientes as cl', 'cl.id', 'cb.id_cliente')
      .select(
        'cl.id as id_cliente',
        'cl.nome',
        'cb.id as id_cobranca',
        'cb.descricao',
        'cb.status',
        'cb.valor',
        'cb.vencimento'
      )
      .where('cb.status', 'Paga');

    if (!cobrancasPagas) {
      return res.status(404).json('Não foi possível fazer a listagem das cobranças pagas!');
    }

    return res.status(200).json(cobrancasPagas);
  } catch (error) {
    return res.status(400).json(error.message);
  }
};

module.exports = {
  cadastrarCobranca,
  listarCobrancas,
  listarCobrancasPorCliente,
  buscarCobrancas,
  editarCobrancas,
  apagarCobranca,
  cobrancasPagas,
  cobrancasPrevistas,
  cobrancasVencidas,
  cardTotalPagas,
  cardTotalPrevista,
  cardTotalVencida
};

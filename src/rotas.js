const express = require('express');
const atualizarUsuario = require('./controladores/AtualizarUsuario');
const cliente = require('./controladores/cliente');
const usuario = require('./controladores/usuarios');
const login = require('./controladores/login');
const { authenticated } = require('./intermediarios/auth');
const cobrancas = require('./controladores/cobrancas');

const rotas = express();

rotas.post('/cadastro', usuario.criarUsuario);
rotas.post('/login', login.fazerLogin);

rotas.use(authenticated);

rotas.put('/atualizarperfil', atualizarUsuario.atualizarPerfilUsuario);

rotas.post("/cadastrocliente", cliente.cadastrarCliente);
rotas.get("/clientes", cliente.listarClientes);
rotas.get('/clientes/ver_todos_clientes', cliente.verTodosClientes);
rotas.put('/clientes/:id', cliente.atualizarCliente);
rotas.get('/clientes', cliente.ordenarBuscarClientes);
rotas.get('/clientes/:id', cliente.detalharCliente);

rotas.post('/cadastrocobranca', cobrancas.cadastrarCobranca);
rotas.get('/cobrancas', cobrancas.listarCobrancas);
rotas.get('/cobrancas/card_total_paga', cobrancas.cardTotalPagas);
rotas.get('/cobrancas/card_total_prevista', cobrancas.cardTotalPrevista);
rotas.get('/cobrancas/card_total_vencidas', cobrancas.cardTotalVencida);
rotas.get('/cobrancas/vencidas_cobrancas', cobrancas.cobrancasVencidas);
rotas.get('/cobrancas/pagas_cobrancas', cobrancas.cobrancasPagas);
rotas.get('/cobrancas/buscar_cobranca/:id', cobrancas.buscarCobrancas);
rotas.get('/cobrancas/pendente_cobrancas', cobrancas.cobrancasPrevistas);
rotas.get('/cobrancas/:id', cobrancas.listarCobrancasPorCliente);

rotas.put('/cobrancas/:id', cobrancas.editarCobrancas);
rotas.delete('/cobrancas/:id', cobrancas.apagarCobranca);

module.exports = rotas;
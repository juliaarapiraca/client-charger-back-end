const yup = require('./yup');

const schemaAtualizarCliente = yup.object().shape({
  nome: yup.string().required(),
  email: yup.string().email().required(),
  cpf: yup.string().min(11).required(),
  telefone: yup.string().min(11).required(),
  cep: yup.string().min(8).nullable(),
  logradouro: yup.string().nullable(),
  complemento: yup.string().nullable(),
  bairro: yup.string().nullable(),
  cidade: yup.string().nullable(),
  estado: yup.string().nullable(),
  status: yup.number().nullable(),
});


const schemaOrdernarBuscar = yup.object().shape({
  nome: yup.string().required(),
  email: yup.string().email(),
  cpf: yup.string().min(10)
});

module.exports = {
  schemaAtualizarCliente,
  schemaOrdernarBuscar
};

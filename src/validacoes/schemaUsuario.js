const yup = require('./yup');

const schemaCadastroUsuario = yup.object().shape({
  nome: yup.string().required(),
  email: yup.string().required().email(),
  senha: yup.string().required().trim().min(4)
});

const schemaAtualizarUsuario = yup.object().shape({
  nome: yup.string(),
  email: yup.string().email(),
  senha: yup.string().trim().min(4),
  cpf: yup.number().min(13),
  telefone: yup.number().min(11)
});

const schemaLoginUsuario = yup.object().shape({
  email: yup.string().required().email(),
  senha: yup.string().required().trim().min(4)
})

module.exports = {
  schemaCadastroUsuario,
  schemaAtualizarUsuario,
  schemaLoginUsuario
}
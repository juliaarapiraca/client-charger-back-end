const yup = require('yup');

const schemaCadastroCobranca = yup.object().shape({
    descricao: yup.string().required(),
    status: yup.string().required(),
    valor: yup.number().required(),
    vencimento: yup.date().required()
});

const schemaEditarCobrancas = yup.object().shape({
    descricao: yup.string().required(),
    status: yup.string().required(),
    valor: yup.number().integer().required(),
    vencimento: yup.date().required()
});

module.exports = {
    schemaCadastroCobranca,
    schemaEditarCobrancas
};

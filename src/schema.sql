CREATE DATABASE meuagiota

DROP table IF Exists usuarios;
create table usuarios(
	  id 			serial primary key,
  	nome 		varchar(50) not null,
  	email 		varchar(50) unique not null,
  	senha		text not null,
    cpf 		varchar(13) unique,
    telefone 	varchar(11) unique  	
);

DROP table IF Exists clientes;
create table clientes(
	  id 			serial primary key,
  	nome 		varchar(50) not null,
    email 		varchar(50) unique not null, 
    cpf 		varchar(13) unique not null,
    telefone 	varchar(11) not null,
    cep			varchar(8),
    logradouro  varchar(50),
    complemento varchar(20),
    bairro 		varchar(50),
    cidade		varchar(30),
    estado		varchar(2),
  	status      smallint default 0,
  	id_usuario 	int,
  	foreign key (id_usuario) references usuarios (id)   	
);

DROP TABLE IF EXISTS cobranças;
create table cobranças(
	id serial primary key,
  id_cliente INT NOT NULL,
  descricao TEXT NOT NULL,
  status TEXT NOT NULL,
  valor INT NOT NULL,
  vencimento DATE NOT NULL,
  foreign key (id_cliente) references clientes(id)
);
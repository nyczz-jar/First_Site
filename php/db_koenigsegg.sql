SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

-- CRIANDO TABELAS DO BANCO DE DADOS KOENIGSEGG --  

CREATE TABLE `cars` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `modelo` varchar(100) NOT NULL,
  `ano` int(4) NOT NULL,
  `preco` decimal(10,2) NOT NULL,
  `potencia` int(5) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `senha` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- INSERINDO DADOS NA TABELA USERS --
INSERT INTO users ('id', 'nome', 'email', 'senha') VALUES
('1','Admin Koenigsegg','admin@koenigsegg.com', 'admin1234'),
('2','User Teste','user@koenigsegg.com', 'user1234');

-- INSERINDO DADOS NA TABELA CARS --

INSERT INTO cars ('id', 'modelo', 'ano', 'preco', 'potencia') VALUES
('1','Koenigsegg Regera', 2020, 3700000.00, 1500),
('2','Koenigsegg Jesko Sadairs Spear', 2025, 5000000.00, 1625),
('3','Koenigsegg Agera RS Carbon Edition', 2015, 2200000.00, 1176),
('4','Koenigsegg CCX', 2010, 1550000.00, 806),
('5','Koenigsegg One:1', 2014, 7200000.00, 1360),
('6','Koenigsegg Gemera', 2020, 3702000.00, 2332);
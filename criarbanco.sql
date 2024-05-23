CREATE DATABASE bancodedadostrabalhomba;

USE bancodedadostrabalhomba;

DROP TABLE IF EXISTS `cliente`;
DROP TABLE IF EXISTS `endereco`;

CREATE TABLE `cliente` (
  `id` int NOT NULL AUTO_INCREMENT,
  `codigo` varchar(255) NOT NULL,
  `nome` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo` (`codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `endereco` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cliente_codigo` varchar(255) DEFAULT NULL,
  `indice` int NOT NULL,
  `logradouro` varchar(255) NOT NULL,
  `numero` varchar(50) NOT NULL,
  `complemento` varchar(255) DEFAULT NULL,
  `cidade` varchar(255) NOT NULL,
  `estado` varchar(50) NOT NULL,
  `cep` varchar(20) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `cliente_codigo` (`cliente_codigo`),
  CONSTRAINT `endereco_ibfk_1` FOREIGN KEY (`cliente_codigo`) REFERENCES `cliente` (`codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOCK TABLES `cliente` WRITE;
INSERT INTO `cliente` VALUES (1,'cliente001','Nome do Cliente');
UNLOCK TABLES;
LOCK TABLES `endereco` WRITE;
INSERT INTO `endereco` VALUES (1,'cliente001',1,'Rua Exemplo','123','Apto 101','Cidade Exemplo','Estado Exemplo','12345-678'),(2,'cliente001',1,'Rua Exemplo','123','Apto 101','Cidade Exemplo','Estado Exemplo','12345-678');
UNLOCK TABLES;
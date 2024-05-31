const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
const port = 3000;

const SECRET_KEY = 'SECRET';
app.use(bodyParser.json());

function authenticateJWT(req, res, next) {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ message: 'Token de autenticação não fornecido' });
    }

    jwt.verify(token.split(' ')[1], SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Falha na autenticação do token' });
        }
        req.user = user;
        next();
    });
}

const pool = new Pool({
    user: 'kong',
    host: 'kong-database',
    database: 'postgres',
    password: 'kong', 
    port: 5432,
});

async function initializeDatabase() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS cliente (
                id SERIAL PRIMARY KEY,
                codigo VARCHAR(255) NOT NULL,
                nome VARCHAR(255) NOT NULL,
                UNIQUE (codigo)
            );
            
            CREATE TABLE IF NOT EXISTS endereco (
                id SERIAL PRIMARY KEY,
                cliente_codigo VARCHAR(255) REFERENCES cliente (codigo),
                indice INT NOT NULL,
                logradouro VARCHAR(255) NOT NULL,
                numero VARCHAR(50) NOT NULL,
                complemento VARCHAR(255),
                cidade VARCHAR(255) NOT NULL,
                estado VARCHAR(50) NOT NULL,
                cep VARCHAR(20) NOT NULL
            );
        `);


        const result = await pool.query(`SELECT * FROM cliente WHERE codigo = 'cliente001'`);
        if (result.rows.length === 0) {
            await pool.query(`
                INSERT INTO cliente (codigo, nome) VALUES ('cliente001', 'Nome do Cliente');
                INSERT INTO endereco (cliente_codigo, indice, logradouro, numero, complemento, cidade, estado, cep) 
                VALUES 
                ('cliente001', 1, 'Rua Exemplo', '123', 'Apto 101', 'Cidade Exemplo', 'Estado Exemplo', '12345-678'),
                ('cliente001', 2, 'Rua Exemplo 2', '456', 'Apto 202', 'Cidade Exemplo', 'Estado Exemplo', '12345-678');
            `);
        }
    } catch (err) {
        console.error('Erro ao inicializar o banco de dados:', err);
        process.exit(1); 
    }
}

initializeDatabase().then(() => {
    app.listen(port, () => {
        console.log(`Servidor rodando na porta ${port}`);
    });
});

app.post('/api/v1/login', (req, res) => {
    const { username, password } = req.body;
    const user = { id: 1, username: 'admin', password: '123456' };

    if (username === user.username && password === user.password) {
        const token = jwt.sign({ sub: user.id }, SECRET_KEY, { expiresIn: '1h' });
        return res.send({ token });
    }

    res.status(401).send({ message: 'Usuário ou senha incorretos' });
});

app.post('/api/v1/cliente', authenticateJWT, (req, res) => {
    const { codigo, nome } = req.body;
    pool.query('INSERT INTO cliente (codigo, nome) VALUES ($1, $2)', [codigo, nome], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send({ message: 'Erro ao criar o cliente' });
        }
        res.status(201).send({ message: 'Cliente criado com sucesso' });
    });
});

app.get('/api/v1/cliente/:codigo', authenticateJWT, (req, res) => {
    const codigo = req.params.codigo;
    pool.query('SELECT * FROM cliente WHERE codigo = $1', [codigo], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send({ message: 'Erro ao buscar o cliente' });
        }
        if (result.rows.length === 0) {
            return res.status(404).send({ message: 'Cliente não encontrado' });
        }
        const cliente = result.rows[0];
        res.status(200).send(cliente);
    });
});

app.get('/api/v1/cliente', authenticateJWT, (req, res) => {
    pool.query('SELECT * FROM cliente', (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send({ message: 'Erro ao buscar os clientes' });
        }
        res.status(200).send(result.rows);
    });
});

app.post('/api/v1/cliente/:codigo/endereco', authenticateJWT, (req, res) => {
    const codigoCliente = req.params.codigo;
    const { indice, logradouro, numero, complemento, cidade, estado, cep } = req.body;
    pool.query('SELECT * FROM cliente WHERE codigo = $1', [codigoCliente], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send({ message: 'Erro ao verificar o cliente' });
        }

        if (result.rows.length === 0) {
            return res.status(404).send({ message: 'Cliente não encontrado' });
        }
        pool.query('INSERT INTO endereco (cliente_codigo, indice, logradouro, numero, complemento, cidade, estado, cep) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
            [codigoCliente, indice, logradouro, numero, complemento, cidade, estado, cep],
            (err, result) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send({ message: 'Erro ao adicionar o endereço' });
                }
                res.status(201).send({ message: 'Endereço adicionado com sucesso' });
            });
    });
});

app.get('/api/v1/cliente/:codigo/endereco/', authenticateJWT, (req, res) => {
    const codigoCliente = req.params.codigo;
    pool.query('SELECT * FROM cliente WHERE codigo = $1', [codigoCliente], (err, resultCliente) => {
        if (err) {
            console.error(err);
            return res.status(500).send({ message: 'Erro ao verificar o cliente' });
        }
        if (resultCliente.rows.length === 0) {
            return res.status(404).send({ message: 'Cliente não encontrado' });
        }
        pool.query('SELECT * FROM endereco WHERE cliente_codigo = $1', [codigoCliente], (err, resultEnderecos) => {
            if (err) {
                console.error(err);
                return res.status(500).send({ message: 'Erro ao buscar os endereços' });
            }
            res.status(200).send(resultEnderecos.rows);
        });
    });
});

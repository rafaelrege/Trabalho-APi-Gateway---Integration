const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
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
// Coloca os dados do banco de dados no meu caso prof criei um root e coloquei o nome do banco
const db = mysql.createConnection({ host: 'localhost', user: 'rafael', password: '123456', database: 'bancodedadostrabalhomba'});
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
    db.query('INSERT INTO Cliente (codigo, nome) VALUES (?, ?)', [codigo, nome], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send({ message: 'Erro ao criar o cliente' });
        }
        res.status(201).send({ message: 'Cliente criado com sucesso' });
    });
});
app.get('/api/v1/cliente/:codigo', authenticateJWT, (req, res) => {
    const codigo = req.params.codigo;
    db.query('SELECT * FROM Cliente WHERE codigo = ?', [codigo], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send({ message: 'Erro ao buscar o cliente' });
        }
        if (result.length === 0) {
            return res.status(404).send({ message: 'Cliente não encontrado' });
        }
        const cliente = result[0];
        res.status(200).send(cliente);
    });
});
app.get('/api/v1/cliente', authenticateJWT, (req, res) => {
    db.query('SELECT * FROM Cliente', (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send({ message: 'Erro ao buscar os clientes' });
        }
        res.status(200).send(result);
    });
});
app.post('/api/v1/cliente/:codigo/endereco', authenticateJWT, (req, res) => {
    const codigoCliente = req.params.codigo;
    const { indice, logradouro, numero, complemento, cidade, estado, cep } = req.body;
    db.query('SELECT * FROM Cliente WHERE codigo = ?', [codigoCliente], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send({ message: 'Erro ao verificar o cliente' });
        }

        if (result.length === 0) {
            return res.status(404).send({ message: 'Cliente não encontrado' });
        }
        db.query('INSERT INTO Endereco (cliente_codigo, indice, logradouro, numero, complemento, cidade, estado, cep) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
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
    db.query('SELECT * FROM Cliente WHERE codigo = ?', [codigoCliente], (err, resultCliente) => {
        if (err) {
            console.error(err);
            return res.status(500).send({ message: 'Erro ao verificar o cliente' });
        }
        if (resultCliente.length === 0) {
            return res.status(404).send({ message: 'Cliente não encontrado' });
        }
        db.query('SELECT * FROM Endereco WHERE cliente_codigo = ?', [codigoCliente], (err, resultEnderecos) => {
            if (err) {
                console.error(err);
                return res.status(500).send({ message: 'Erro ao buscar os endereços' });
            }
            res.status(200).send(resultEnderecos);
        });
    });
});
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});

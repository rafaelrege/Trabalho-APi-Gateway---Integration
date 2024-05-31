# Trabalho API Gateway & Integration

## Configurar Banco de Dados na Aplicação
Para configurar o banco de dados na aplicação, ajuste as informações de conexão conforme necessário na linha 28 do `app.js`. Um exemplo de configuração é:
```js
const pool = new Pool({
    user: 'postgres',
    host: 'kong-database',
    database: 'postgres',
    password: 'password',
    port: 5432,
});
```

## Importar Collection para o Postman
Você pode importar as collections para o Postman, por exemplo, para testar a conexão, utilizando o arquivo "Trabalho APi Gateway & Integration.postman_collection.json".
 
 ## Autenticação das Collections
Para autenticar e passar os parâmetros configurados, utilize a linha 36 do app.js, que faz a geração do token:
```js
app.post('/api/v1/login', (req, res) => {
    const { username, password } = req.body;
    const user = { id: 1, username: 'admin', password: '123456' };

    if (username === user.username && password === user.password) {
        const token = jwt.sign({ sub: user.id }, SECRET_KEY, { expiresIn: '1h' });
        return res.send({ token });
    }

    res.status(401).send({ message: 'Usuário ou senha incorretos' });
});
```

## Kong e Docker
Para executar o Docker e iniciar o banco de dados e a aplicação, utilize o seguinte comando:
docker-compose up --build

## Executável para Windows
Para configurar o ambiente no Windows, utilize os seguintes comandos:
cd Trabalho-API
kong-setup.bat 

## Executável para Linux
Para configurar o ambiente no Linux, utilize os seguintes comandos:
cd Trabalho-API
chmod +x kong-setup.sh
./kong-setup.sh

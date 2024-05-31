# Trabalho API GATEWAY & INTEGRATION

# Configurar Banco de dados na aplicação
 - Informações da conexão com o banco de dados  se necessaio algum ajuste seria a linha 28 do app.js colocando os dados para acessar o banco de dados como o meu exemplo:

const pool = new Pool({
    user: 'postgres',
    host: 'kong-database',
    database: 'postgres',
    password: 'password',
    port: 5432,
});

# Collection.json
 - É possivel fazer o import das collections para o Postman por exemplo para testar a conexão atraves do arquivo "Trabalho APi Gateway & Integration.postman_collection.json"
 
 # Autenticação das Collection.json
 - Lembrando que para autenticar e passar os paramentros configurados na linha 36 do 'app.js' que faz a geração do token
app.post('/api/v1/login', (req, res) => {
    const { username, password } = req.body;
    const user = { id: 1, username: 'admin', password: '123456' };

# Kong e docker 
 - Comando para executar o docker e chamar o banco e executar a aplicação:
docker-compose up --build


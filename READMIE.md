Trabalho API GATEWAY & INTEGRATION

Para executar esse programa é necessario realizar uma conexão com o MySQL e criar o banco de dados conforme o arquivo "criarbanco.sql"

Depois de criado é necessario adequar a linha26 do app.js colocando os dados para acessar o banco de dados como o meu exemplo:
const db = mysql.createConnection({ host: 'localhost', user: 'rafael', password: '123456', database: 'bancodedadostrabalhomba'});

Depois de adequado é necessario realizar o "npm install" lembrando que é necessario rodar dentro da pasta 'Trabalho-API'
E para realizar o start é o comando node app.js

Depois de realizado é possivel realizar os get e post importando a collection "Trabalho APi Gateway & Integration.postman_collection.json"
Lembrando que para autenticar é passa os paramentros configurados na linha 29 do 'app.js'
    const user = { id: 1, username: 'admin', password: '123456' };

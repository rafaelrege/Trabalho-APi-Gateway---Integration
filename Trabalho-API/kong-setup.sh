#!/bin/bash

# Definir variáveis
KONG_ADMIN_URL="http://localhost:8001"
API_NAME="node-service"
UPSTREAM_URL="http://node-service:3000"
SERVICE_PATH="/api/v1"
USERNAME="admin"
PASSWORD="123456"
SECRET_KEY="SECRET"

# Verificar se o serviço já existe
SERVICE_EXISTS=$(curl -s -o /dev/null -w "%{http_code}" $KONG_ADMIN_URL/services/$API_NAME)
if [ $SERVICE_EXISTS -eq 404 ]; then
    echo "Criando o serviço..."
    curl -i -X POST --url $KONG_ADMIN_URL/services/ --data "name=$API_NAME" --data "url=$UPSTREAM_URL"
else
    echo "Serviço já existe."
fi

# Verificar e criar rotas
declare -a ROUTES=("/login" "/cliente" "/cliente/:codigo" "/cliente/:codigo/endereco")

for ROUTE in "${ROUTES[@]}"; do
    ROUTE_EXISTS=$(curl -s $KONG_ADMIN_URL/services/$API_NAME/routes | jq '.data[] | select(.paths[] == "'$SERVICE_PATH$ROUTE'") | .id' | wc -l)
    if [ $ROUTE_EXISTS -eq 0 ]; then
        echo "Criando rota $ROUTE..."
        curl -i -X POST --url $KONG_ADMIN_URL/services/$API_NAME/routes --data "paths[]=$SERVICE_PATH$ROUTE"
    else
        echo "Rota $ROUTE já existe."
    fi
done

# Verificar se o consumidor já existe
CONSUMER_EXISTS=$(curl -s -o /dev/null -w "%{http_code}" $KONG_ADMIN_URL/consumers/$USERNAME)
if [ $CONSUMER_EXISTS -eq 404 ]; then
    echo "Criando consumidor..."
    curl -i -X POST --url $KONG_ADMIN_URL/consumers/ --data "username=$USERNAME" --data "custom_id=$USERNAME"
else
    echo "Consumidor já existe."
fi

# Verificar se as credenciais JWT já existem
JWT_EXISTS=$(curl -s $KONG_ADMIN_URL/consumers/$USERNAME/jwt | jq '.data[] | select(.key == "'$SECRET_KEY'") | .id' | wc -l)
if [ $JWT_EXISTS -eq 0 ]; then
    echo "Criando credenciais JWT..."
    curl -i -X POST --url $KONG_ADMIN_URL/consumers/$USERNAME/jwt --data "key=$SECRET_KEY" --data "algorithm=HS256"
else
    echo "Credenciais JWT já existem."
fi

# Verificar se o plugin JWT já existe
PLUGIN_EXISTS=$(curl -s $KONG_ADMIN_URL/services/$API_NAME/plugins | jq '.data[] | select(.name == "jwt") | .id' | wc -l)
if [ $PLUGIN_EXISTS -eq 0 ]; then
    echo "Aplicando plugin JWT..."
    curl -i -X POST --url $KONG_ADMIN_URL/services/$API_NAME/plugins --data "name=jwt"
else
    echo "Plugin JWT já aplicado."
fi

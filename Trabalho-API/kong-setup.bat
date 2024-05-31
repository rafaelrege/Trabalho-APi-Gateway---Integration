@echo off
setlocal

REM Definir variáveis
set "KONG_ADMIN_URL=http://localhost:8001"
set "API_NAME=node-service"
set "UPSTREAM_URL=http://node-service:3000"
set "SERVICE_PATH=/api/v1"
set "USERNAME=admin"
set "PASSWORD=123456"
set "SECRET_KEY=SECRET"

REM Verificar se o serviço já existe
curl -s -o NUL -w "%%{http_code}" %KONG_ADMIN_URL%/services/%API_NAME% | findstr /r "404"
if %errorlevel% equ 0 (
    echo "Criando o serviço..."
    curl -i -X POST --url %KONG_ADMIN_URL%/services/ --data "name=%API_NAME%" --data "url=%UPSTREAM_URL%"
) else (
    echo "Serviço já existe."
)

REM Verificar e criar rotas
for %%i in ("/login" "/cliente" "/cliente/:codigo" "/cliente/:codigo/endereco") do (
    curl -s -o NUL -w "%%{http_code}" %KONG_ADMIN_URL%/services/%API_NAME%/routes | findstr /r "404"
    if %errorlevel% equ 0 (
        echo "Criando rota %%i..."
        curl -i -X POST --url %KONG_ADMIN_URL%/services/%API_NAME%/routes --data "paths[]=%SERVICE_PATH%%%i"
    ) else (
        echo "Rota %%i já existe."
    )
)

REM Verificar se o consumidor já existe
curl -s -o NUL -w "%%{http_code}" %KONG_ADMIN_URL%/consumers/%USERNAME% | findstr /r "404"
if %errorlevel% equ 0 (
    echo "Criando consumidor..."
    curl -i -X POST --url %KONG_ADMIN_URL%/consumers/ --data "username=%USERNAME%" --data "custom_id=%USERNAME%"
) else (
    echo "Consumidor já existe."
)

REM Verificar se as credenciais JWT já existem
curl -s -o NUL -w "%%{http_code}" %KONG_ADMIN_URL%/consumers/%USERNAME%/jwt | findstr /r "404"
if %errorlevel% equ 0 (
    echo "Criando credenciais JWT..."
    curl -i -X POST --url %KONG_ADMIN_URL%/consumers/%USERNAME%/jwt --data "key=%SECRET_KEY%" --data "algorithm=HS256"
) else (
    echo "Credenciais JWT já existem."
)

REM Verificar se o plugin JWT já existe
curl -s -o NUL -w "%%{http_code}" %KONG_ADMIN_URL%/services/%API_NAME%/plugins | findstr /r "404"
if %errorlevel% equ 0 (
    echo "Aplicando plugin JWT..."
    curl -i -X POST --url %KONG_ADMIN_URL%/services/%API_NAME%/plugins --data "name=jwt"
) else (
    echo "Plugin JWT já aplicado."
)

endlocal

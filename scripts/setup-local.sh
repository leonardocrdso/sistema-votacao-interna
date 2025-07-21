#!/bin/bash

# Script de configuração e inicialização local do Sistema de Votação Interna
# Esta versão roda tudo sem Docker, para testes em ambiente de desenvolvimento.

set -e

echo "🚀 Configurando e iniciando localmente o Sistema de Votação Interna..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções de log
log_info()    { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error()   { echo -e "${RED}❌ $1${NC}"; }

# 1. Verificar Node.js e npm
check_node() {
    log_info "Verificando Node.js e npm..."
    if ! command -v node &> /dev/null; then
        log_error "Node.js não encontrado. Instale antes de prosseguir."
        exit 1
    fi
    if ! command -v npm &> /dev/null; then
        log_error "npm não encontrado. Instale antes de prosseguir."
        exit 1
    fi
    NODE_VERSION=$(node --version)
    NPM_VERSION=$(npm --version)
    log_success "Node.js $NODE_VERSION e npm $NPM_VERSION disponíveis"
}

# 2. Verificar PostgreSQL (local)
check_postgres() {
    log_info "Verificando psql (PostgreSQL)..."
    if ! command -v psql &> /dev/null; then
        log_warning "psql não encontrado. Certifique‑se de que o PostgreSQL esteja rodando e no PATH."
    else
        log_success "psql disponível"
    fi
}

# 3. Verificar Redis (local)
check_redis() {
    log_info "Verificando redis-cli..."
    if ! command -v redis-cli &> /dev/null; then
        log_warning "redis-cli não encontrado. Se não usar Redis local, ignore este aviso."
    else
        log_success "redis-cli disponível"
    fi
}

# 4. Configurar arquivos de ambiente
setup_env_files() {
    log_info "Configurando arquivos .env..."
    for svc in backend frontend; do
        if [ -f "$svc/.env.example" ] && [ ! -f "$svc/.env" ]; then
            cp "$svc/.env.example" "$svc/.env"
            log_success "Arquivo $svc/.env criado a partir de .env.example"
        else
            log_info "Arquivo $svc/.env já existe ou não há exemplo"
        fi
    done
}

# 5. Criar diretórios necessários
create_directories() {
    log_info "Criando diretórios de uploads, logs e build..."
    mkdir -p backend/uploads backend/logs frontend/dist
    log_success "Diretórios criados"
}

# 6. Instalar dependências via npm
install_dependencies() {
    log_info "Instalando dependências do backend..."
    pushd backend > /dev/null
      npm install
    popd > /dev/null
    log_success "Dependências backend instaladas"

    log_info "Instalando dependências do frontend..."
    pushd frontend > /dev/null
      npm install
    popd > /dev/null
    log_success "Dependências frontend instaladas"
}

# 7. Executar migrações e seed no banco
run_migrations() {
    log_info "Executando migrações (Prisma) e seed..."
    pushd backend > /dev/null
      npx prisma migrate dev --name init --preview-feature
      npx prisma generate
      npm run prisma:seed
    popd > /dev/null
    log_success "Migrações aplicadas e seed inserida"
}

# 8. Iniciar serviços em background
start_services() {
    log_info "Iniciando backend e frontend em modo dev..."
    # Backend em porta 3001
    pushd backend > /dev/null
      npm run dev &
      BACKEND_PID=$!
    popd > /dev/null

    # Frontend em porta 3000
    pushd frontend > /dev/null
      npm run dev &
      FRONTEND_PID=$!
    popd > /dev/null

    log_success "Serviços iniciados: backend (PID $BACKEND_PID), frontend (PID $FRONTEND_PID)"
}

# 9. Checar saúde dos serviços
health_check() {
    log_info "Verificando endpoints de saúde..."
    sleep 5
    if curl -fs http://localhost:3001/health > /dev/null; then
        log_success "Backend OK em http://localhost:3001/health"
    else
        log_warning "Backend não respondeu em /health"
    fi
    if curl -fs http://localhost:3000/ > /dev/null; then
        log_success "Frontend OK em http://localhost:3000/"
    else
        log_warning "Frontend não respondeu na home"
    fi
}

# 10. Informações finais
show_final_info() {
    echo
    log_success "🎉 Ambiente local iniciado com sucesso!"
    echo "📋 Endpoints:"
    echo "  • Frontend: http://localhost:3000"
    echo "  • Backend API: http://localhost:3001"
    echo
    log_info "Para parar os serviços, use:"
    echo "  kill $BACKEND_PID $FRONTEND_PID"
    echo
}

# Fluxo principal
main() {
    check_node
    check_postgres
    check_redis
    setup_env_files
    create_directories
    install_dependencies
    run_migrations
    start_services
    health_check
    show_final_info
}

main "$@"

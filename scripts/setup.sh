#!/bin/bash

# Script de configuração inicial do Sistema de Votação Interna
# Este script configura o ambiente de desenvolvimento completo com Traefik

set -e

echo "🚀 Configurando Sistema de Votação Interna com Traefik..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para logs coloridos
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar se Docker está instalado
check_docker() {
    log_info "Verificando Docker..."
    if ! command -v docker &> /dev/null; then
        log_error "Docker não está instalado. Por favor, instale o Docker primeiro."
        exit 1
    fi
    
    if ! docker compose version &> /dev/null; then
        log_error "Docker Compose não está instalado. Por favor, instale o Docker Compose primeiro."
        exit 1
    fi
    
    log_success "Docker está disponível"
}

# Verificar se Node.js está instalado (para desenvolvimento local)
check_node() {
    log_info "Verificando Node.js..."
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        log_success "Node.js $NODE_VERSION está disponível"
    else
        log_warning "Node.js não encontrado. Usando apenas Docker."
    fi
}

# Criar arquivos de ambiente se não existirem
setup_env_files() {
    log_info "Configurando arquivos de ambiente..."
    
    # Backend .env
    if [ ! -f "backend/.env" ]; then
        cp backend/.env.example backend/.env
        log_success "Arquivo backend/.env criado"
    else
        log_info "Arquivo backend/.env já existe"
    fi
    
    # Frontend .env
    if [ ! -f "frontend/.env" ]; then
        cp frontend/.env.example frontend/.env
        log_success "Arquivo frontend/.env criado"
    else
        log_info "Arquivo frontend/.env já existe"
    fi

    # Arquivo de produção (opcional)
    if [ ! -f ".env.prod" ]; then
        if [ -f ".env.prod.example" ]; then
            cp .env.prod.example .env.prod
            log_success "Arquivo .env.prod criado"
            log_warning "Configure as variáveis em .env.prod para produção"
        fi
    fi
}

# Criar diretórios necessários
create_directories() {
    log_info "Criando diretórios necessários..."
    
    mkdir -p backend/uploads
    mkdir -p backend/logs
    mkdir -p frontend/dist
    mkdir -p traefik/letsencrypt
    
    # Definir permissões corretas para Let's Encrypt
    chmod 600 traefik/letsencrypt 2>/dev/null || true
    
    log_success "Diretórios criados"
}

# Baixar imagens Docker
pull_images() {
    log_info "Baixando imagens Docker..."
    
    docker pull postgres:15
    docker pull node:18-alpine
    docker pull traefik:v3.0
    docker pull redis:7-alpine
    docker pull adminer
    
    log_success "Imagens Docker baixadas"
}

# Construir containers
build_containers() {
    log_info "Construindo containers..."
    
    docker compose build --parallel
    
    log_success "Containers construídos"
}

# Inicializar banco de dados
init_database() {
    log_info "Inicializando banco de dados..."
    
    # Iniciar apenas o PostgreSQL
    docker compose up -d postgres
    
    # Aguardar PostgreSQL estar pronto
    log_info "Aguardando PostgreSQL estar pronto..."
    sleep 15
    
    # Verificar se PostgreSQL está respondendo
    local retries=0
    local max_retries=30
    
    while [ $retries -lt $max_retries ]; do
        if docker compose exec -T postgres pg_isready -U voting_user -d voting_system >/dev/null 2>&1; then
            log_success "PostgreSQL está pronto"
            return 0
        fi
        log_info "Aguardando PostgreSQL... ($((retries + 1))/$max_retries)"
        sleep 5
        ((retries++))
    done
    
    log_error "PostgreSQL não ficou pronto a tempo"
    return 1
}

# # Executar migrações e seed
# run_migrations() {
#     log_info "Executando migrações do banco..."
    
#     # Iniciar backend temporariamente para rodar migrações
#     docker compose run --rm backend npx prisma migrate deploy
#     docker compose run --rm backend npx prisma generate
#     docker compose run --rm backend npm run prisma:seed
    
#     log_success "Migrações executadas e dados iniciais inseridos"
# }

# Verificar saúde dos serviços
health_check() {
    log_info "Verificando saúde dos serviços..."
    
    # Iniciar todos os serviços
    docker compose up -d
    
    # Aguardar serviços estarem prontos
    log_info "Aguardando serviços estarem prontos..."
    sleep 45
    
    local services_ok=0
    
    # Testar Traefik
    if curl -f http://localhost:8080/api/version >/dev/null 2>&1; then
        log_success "Traefik está respondendo"
        ((services_ok++))
    else
        log_warning "Traefik Dashboard pode estar iniciando..."
    fi
    
    # Testar backend via Traefik
    if curl -f http://localhost/api/health >/dev/null 2>&1; then
        log_success "Backend está respondendo via Traefik"
        ((services_ok++))
    else
        log_warning "Backend pode estar iniciando..."
        # Tentar direto na porta 3001 como fallback
        if curl -f http://localhost:3001/health >/dev/null 2>&1; then
            log_info "Backend responde diretamente na porta 3001"
        fi
    fi
    
    # Testar frontend via Traefik
    if curl -f http://localhost >/dev/null 2>&1; then
        log_success "Frontend está respondendo via Traefik"
        ((services_ok++))
    else
        log_warning "Frontend pode estar iniciando..."
        # Tentar direto na porta 3000 como fallback
        if curl -f http://localhost:3000 >/dev/null 2>&1; then
            log_info "Frontend responde diretamente na porta 3000"
        fi
    fi
    
    if [ $services_ok -ge 1 ]; then
        log_success "Pelo menos um serviço está funcionando!"
    else
        log_warning "Serviços podem estar iniciando. Aguarde alguns minutos."
        log_info "Verifique os logs com: docker compose logs -f"
    fi
}

# Exibir informações finais
show_final_info() {
    echo
    log_success "🎉 Configuração concluída com sucesso!"
    echo
    echo "📋 Informações do Sistema:"
    echo "  • Frontend (via Traefik): http://localhost"
    echo "  • Backend API (via Traefik): http://localhost/api"
    echo "  • Traefik Dashboard: http://localhost:8080"
    echo "  • Adminer (DB): http://localhost/adminer"
    echo ""
    echo "📋 Acesso Direto (desenvolvimento):"
    echo "  • Frontend: http://localhost:3000"
    echo "  • Backend: http://localhost:3001"
    echo "  • Database: localhost:5432"
    echo "  • Redis: localhost:6379"
    echo
    echo "🔑 Credenciais:"
    echo "  • Admin Token: eAyL5frRilDo5JivmkrT0CAQ2d4AfGyIXnzV47YRZm2a6GbAnM"
    echo "  • DB User: voting_user"
    echo "  • DB Password: voting_password"
    echo "  • DB Name: voting_system"
    echo
    echo "📚 Comandos úteis:"
    echo "  • docker compose logs -f          # Ver logs"
    echo "  • docker compose down             # Parar serviços"
    echo "  • docker compose up -d            # Iniciar serviços"
    echo "  • docker compose restart          # Reiniciar serviços"
    echo "  • ./scripts/backup.sh backup      # Fazer backup"
    echo
    echo "🌐 URLs importantes:"
    echo "  • Sistema: http://localhost"
    echo "  • Admin: http://localhost/admin"
    echo "  • Traefik: http://localhost:8080"
    echo
    log_info "Para começar a usar, acesse: http://localhost"
    log_warning "Se algo não funcionar, aguarde alguns minutos para os serviços iniciarem completamente."
}

# Função principal
main() {
    echo "Sistema de Votação Interna - Setup com Traefik"
    echo "=============================================="
    echo
    
    check_docker
    check_node
    setup_env_files
    create_directories
    pull_images
    build_containers
    init_database
    # run_migrations
    health_check
    show_final_info
}

# Executar função principal
main "$@"
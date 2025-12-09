#!/usr/bin/env bash
# ==============================================================================
# default-prepare.sh - Script de inicialização de serviços
# ==============================================================================
#
# VARIÁVEIS DE AMBIENTE (todas opcionais):
#
#   APPS_START_ENV
#     Lista de serviços separados por vírgula.
#     Cada serviço contém campos separados por ponto-e-vírgula.
#
#     Campos:
#       name=<string>     Nome identificador do serviço (default: service_N)
#       cmd=<string>      Comando para iniciar o serviço (se vazio, pula o serviço)
#       check=<tipo>      Tipo de healthcheck: http|tcp|cmd|none (default: none)
#       target=<string>   Alvo do healthcheck (necessário se check != none)
#       install=<string>  Comando de instalação antes de iniciar
#
#     Tipos de healthcheck:
#       http   - Requisição HTTP GET. Target: host:port ou host:port/path
#       tcp    - Conexão TCP. Target: host:port
#       cmd    - Comando bash. Target: comando a executar
#       none   - Sem healthcheck, inicia e continua (default)
#
#   WAIT_SECONDS (default: 1)
#     Intervalo em segundos entre tentativas de healthcheck.
#
#   MAX_WAIT (default: 60)
#     Tempo máximo em segundos para aguardar healthcheck.
#
#   STOP_ON_ERROR (default: true)
#     Se "true", para execução no primeiro erro.
#     Se "false", continua mesmo com falhas.
#
#   LOG_LEVEL (default: info)
#     Nível de log: debug|info|warn|error
#
# EXEMPLO:
#
#   export APPS_START_ENV="name=redis;cmd=redis-server --daemonize yes;check=tcp;target=127.0.0.1:6379,name=api;install=npm ci;cmd=node server.js;check=http;target=localhost:3000/health"
#   ./prepare.sh
#
# ==============================================================================

set -o pipefail

# ------------------------------------------------------------------------------
# Configurações
# ------------------------------------------------------------------------------

WAIT_SECONDS="${WAIT_SECONDS:-1}"
MAX_WAIT="${MAX_WAIT:-60}"
STOP_ON_ERROR="${STOP_ON_ERROR:-true}"
LOG_LEVEL="${LOG_LEVEL:-info}"

SEP=$'\x1F'  # Unit Separator (ASCII 31) - seguro para parsing

# Cores para output (desabilitadas se não for terminal)
if [[ -t 1 ]]; then
  RED='\033[0;31m'
  GREEN='\033[0;32m'
  YELLOW='\033[0;33m'
  BLUE='\033[0;34m'
  NC='\033[0m'
else
  RED='' GREEN='' YELLOW='' BLUE='' NC=''
fi

# ------------------------------------------------------------------------------
# Funções de Log
# ------------------------------------------------------------------------------

_log_level_num() {
  case "$1" in
    debug) echo 0 ;;
    info)  echo 1 ;;
    warn)  echo 2 ;;
    error) echo 3 ;;
    *)     echo 1 ;;
  esac
}

_should_log() {
  local level="$1"
  local current_level_num=$(_log_level_num "$LOG_LEVEL")
  local msg_level_num=$(_log_level_num "$level")
  [[ $msg_level_num -ge $current_level_num ]]
}

log_debug() { _should_log debug && echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] ${BLUE}DEBUG${NC} $1"; }
log_info()  { _should_log info  && echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] ${GREEN}INFO${NC}  $1"; }
log_warn()  { _should_log warn  && echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] ${YELLOW}WARN${NC}  $1"; }
log_error() { _should_log error && echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] ${RED}ERROR${NC} $1"; }

# ------------------------------------------------------------------------------
# Validação de Variáveis
# ------------------------------------------------------------------------------

show_config_help() {
  log_info ""
  log_info "Como configurar APPS_START_ENV:"
  log_info ""
  log_info "  Formato: name=<nome>;cmd=<comando>;check=<tipo>;target=<alvo>"
  log_info ""
  log_info "  Campos:"
  log_info "    name    - Nome do serviço (opcional, default: service_N)"
  log_info "    cmd     - Comando para iniciar (obrigatório para executar)"
  log_info "    check   - Tipo de healthcheck: http|tcp|cmd|none (default: none)"
  log_info "    target  - Alvo do healthcheck (necessário se check != none)"
  log_info "    install - Comando de instalação (opcional)"
  log_info ""
  log_info "  Exemplos:"
  log_info "    # Serviço simples sem healthcheck"
  log_info "    export APPS_START_ENV=\"name=worker;cmd=node worker.js;check=none\""
  log_info ""
  log_info "    # Serviço com healthcheck HTTP"
  log_info "    export APPS_START_ENV=\"name=api;cmd=npm start;check=http;target=localhost:3000/health\""
  log_info ""
  log_info "    # Múltiplos serviços (separados por vírgula)"
  log_info "    export APPS_START_ENV=\"name=redis;cmd=redis-server;check=tcp;target=localhost:6379,name=api;install=npm ci;cmd=npm start;check=http;target=localhost:3000\""
  log_info ""
}

validate_env() {
  log_debug "Validando variáveis de ambiente..."

  # APPS_START_ENV não configurada - mostra ajuda e sai com sucesso
  if [[ -z "${APPS_START_ENV:-}" ]]; then
    log_warn "APPS_START_ENV não configurada - nenhum serviço para iniciar"
    show_config_help
    log_info "Nenhuma ação necessária. Finalizando com sucesso."
    exit 0
  fi

  # Validação de WAIT_SECONDS com fallback
  if ! [[ "$WAIT_SECONDS" =~ ^[0-9]+$ ]] || [[ "$WAIT_SECONDS" -lt 1 ]]; then
    log_warn "WAIT_SECONDS inválido ('$WAIT_SECONDS'), usando default: 1"
    WAIT_SECONDS=1
  fi

  # Validação de MAX_WAIT com fallback
  if ! [[ "$MAX_WAIT" =~ ^[0-9]+$ ]] || [[ "$MAX_WAIT" -lt 1 ]]; then
    log_warn "MAX_WAIT inválido ('$MAX_WAIT'), usando default: 60"
    MAX_WAIT=60
  fi

  log_debug "Variáveis validadas: WAIT_SECONDS=$WAIT_SECONDS, MAX_WAIT=$MAX_WAIT"
}

# ------------------------------------------------------------------------------
# Parsing de Serviços
# ------------------------------------------------------------------------------

SERVICES=()
FAILED_SERVICES=()
SERVICE_COUNTER=0

parse_services() {
  log_debug "Parseando APPS_START_ENV..."

  local IFS=','
  read -r -a APPS <<< "$APPS_START_ENV"

  log_info "Entradas detectadas: ${#APPS[@]}"

  for RAW in "${APPS[@]}"; do
    ((SERVICE_COUNTER++))

    local name="" install="" cmd="" check="" target=""

    # Parse dos campos key=value
    local OLD_IFS="$IFS"
    IFS=';'
    read -r -a FIELDS <<< "$RAW"
    IFS="$OLD_IFS"

    for FIELD in "${FIELDS[@]}"; do
      # Ignora campos vazios
      [[ -z "$FIELD" ]] && continue

      local KEY="${FIELD%%=*}"
      local VALUE="${FIELD#*=}"

      case "$KEY" in
        name)    name="$VALUE" ;;
        install) install="$VALUE" ;;
        cmd)     cmd="$VALUE" ;;
        check)   check="$VALUE" ;;
        target)  target="$VALUE" ;;
        *)       log_debug "Campo desconhecido ignorado: $KEY" ;;
      esac
    done

    # Fallback para name: usa service_N se não definido
    if [[ -z "$name" ]]; then
      name="service_${SERVICE_COUNTER}"
      log_debug "[$name] Campo 'name' não definido, usando default: $name"
    fi

    # Sem cmd: pula o serviço com aviso
    if [[ -z "$cmd" ]]; then
      log_warn "[$name] Campo 'cmd' não definido - pulando serviço"
      log_info "[$name] Para configurar: name=$name;cmd=<seu_comando>;check=none"
      continue
    fi

    # Fallback para check: usa 'none' se não definido ou inválido
    if [[ -z "$check" ]]; then
      check="none"
      log_debug "[$name] Campo 'check' não definido, usando default: none"
    elif [[ ! "$check" =~ ^(http|tcp|cmd|none)$ ]]; then
      log_warn "[$name] Campo 'check' inválido ('$check'), usando default: none"
      log_info "[$name] Valores válidos: http|tcp|cmd|none"
      check="none"
    fi

    # Aviso se check != none mas target não definido
    if [[ "$check" != "none" && -z "$target" ]]; then
      log_warn "[$name] Campo 'target' não definido para check=$check - alterando para check=none"
      log_info "[$name] Para usar healthcheck $check, configure: check=$check;target=<alvo>"
      check="none"
    fi

    # Armazena serviço válido
    SERVICES+=("${name}${SEP}${install}${SEP}${cmd}${SEP}${check}${SEP}${target}")
    log_debug "Serviço parseado: name=$name, check=$check, target=${target:-<n/a>}"
  done

  if [[ ${#SERVICES[@]} -eq 0 ]]; then
    log_warn "Nenhum serviço válido para iniciar"
    log_info "Verifique se o campo 'cmd' está configurado para cada serviço"
    show_config_help
    log_info "Finalizando com sucesso."
    exit 0
  fi

  log_info "Serviços válidos para iniciar: ${#SERVICES[@]}"
}

# ------------------------------------------------------------------------------
# Preview dos Serviços
# ------------------------------------------------------------------------------

preview_services() {
  log_info "========== CONFIGURAÇÃO =========="

  local idx=1
  for SVC in "${SERVICES[@]}"; do
    local IFS="$SEP"
    read -r name install cmd check target <<< "$SVC"

    log_info "[$idx] $name"
    log_info "    INSTALL : ${install:-<nenhum>}"
    log_info "    CMD     : $cmd"
    log_info "    CHECK   : $check"
    log_info "    TARGET  : ${target:-<n/a>}"

    ((idx++))
  done

  log_info "=================================="
}

# ------------------------------------------------------------------------------
# Healthcheck Functions
# ------------------------------------------------------------------------------

wait_http() {
  local target="$1"
  local elapsed=0

  # Adiciona http:// se não tiver protocolo
  if [[ ! "$target" =~ ^https?:// ]]; then
    target="http://$target"
  fi

  log_debug "HTTP healthcheck: $target"

  until curl -fsS --max-time 5 "$target" >/dev/null 2>&1; do
    sleep "$WAIT_SECONDS"
    elapsed=$((elapsed + WAIT_SECONDS))

    if [[ $elapsed -ge $MAX_WAIT ]]; then
      log_debug "HTTP timeout após ${elapsed}s"
      return 1
    fi

    log_debug "HTTP tentativa... (${elapsed}s/${MAX_WAIT}s)"
  done

  return 0
}

wait_tcp() {
  local target="$1"
  local host="${target%:*}"
  local port="${target#*:}"
  local elapsed=0

  # Validação do formato host:port
  if [[ -z "$host" || -z "$port" || "$host" == "$port" ]]; then
    log_error "Formato TCP inválido: '$target' (esperado: host:port)"
    return 1
  fi

  if ! [[ "$port" =~ ^[0-9]+$ ]]; then
    log_error "Porta TCP inválida: '$port'"
    return 1
  fi

  log_debug "TCP healthcheck: $host:$port"

  # Tenta usar nc (netcat) se disponível, senão usa /dev/tcp
  local tcp_cmd
  if command -v nc &>/dev/null; then
    tcp_cmd="nc -z -w 1 $host $port"
  else
    tcp_cmd="(echo >/dev/tcp/$host/$port) 2>/dev/null"
  fi

  until eval "$tcp_cmd"; do
    sleep "$WAIT_SECONDS"
    elapsed=$((elapsed + WAIT_SECONDS))

    if [[ $elapsed -ge $MAX_WAIT ]]; then
      log_debug "TCP timeout após ${elapsed}s"
      return 1
    fi

    log_debug "TCP tentativa... (${elapsed}s/${MAX_WAIT}s)"
  done

  return 0
}

wait_cmd() {
  local cmd="$1"
  local elapsed=0

  log_debug "CMD healthcheck: $cmd"

  until eval "$cmd" >/dev/null 2>&1; do
    sleep "$WAIT_SECONDS"
    elapsed=$((elapsed + WAIT_SECONDS))

    if [[ $elapsed -ge $MAX_WAIT ]]; then
      log_debug "CMD timeout após ${elapsed}s"
      return 1
    fi

    log_debug "CMD tentativa... (${elapsed}s/${MAX_WAIT}s)"
  done

  return 0
}

run_healthcheck() {
  local check_type="$1"
  local target="$2"

  case "$check_type" in
    http) wait_http "$target" ;;
    tcp)  wait_tcp "$target" ;;
    cmd)  wait_cmd "$target" ;;
    none)
      log_debug "Healthcheck desabilitado (none)"
      return 0
      ;;
    *)
      log_error "Tipo de healthcheck desconhecido: $check_type"
      return 1
      ;;
  esac
}

# ------------------------------------------------------------------------------
# Execução de Serviços
# ------------------------------------------------------------------------------

start_services() {
  local total=${#SERVICES[@]}
  local current=0
  local success_count=0

  for SVC in "${SERVICES[@]}"; do
    ((current++))

    local IFS="$SEP"
    read -r name install cmd check target <<< "$SVC"

    log_info "----------------------------------------"
    log_info "[$current/$total] Iniciando: $name"

    # Etapa 1: Instalação (se definido)
    if [[ -n "$install" ]]; then
      log_info "[$name] Executando install: $install"

      if ! bash -c "$install"; then
        log_error "[$name] Falha na instalação"
        FAILED_SERVICES+=("$name")

        if [[ "$STOP_ON_ERROR" == "true" ]]; then
          return 1
        fi
        continue
      fi

      log_info "[$name] Instalação concluída"
    fi

    # Etapa 2: Iniciar serviço em background (logs vão para stdout/stderr do container)
    log_info "[$name] Executando: $cmd"
    bash -c "$cmd" &
    local pid=$!

    log_debug "[$name] Processo iniciado com PID: $pid"

    # Pequena pausa para o processo iniciar
    sleep 0.5

    # Verifica se o processo ainda está rodando
    if ! kill -0 "$pid" 2>/dev/null; then
      log_error "[$name] Processo terminou imediatamente (PID: $pid)"
      FAILED_SERVICES+=("$name")

      if [[ "$STOP_ON_ERROR" == "true" ]]; then
        return 1
      fi
      continue
    fi

    # Etapa 3: Healthcheck
    log_info "[$name] Aguardando healthcheck ($check: $target)..."

    if run_healthcheck "$check" "$target"; then
      log_info "[$name] PRONTO"
      ((success_count++))
    else
      log_error "[$name] Timeout no healthcheck após ${MAX_WAIT}s"
      FAILED_SERVICES+=("$name")

      if [[ "$STOP_ON_ERROR" == "true" ]]; then
        return 1
      fi
    fi
  done

  log_info "----------------------------------------"
  log_info "Resultado: $success_count/$total serviços iniciados com sucesso"

  if [[ ${#FAILED_SERVICES[@]} -gt 0 ]]; then
    log_warn "Serviços com falha: ${FAILED_SERVICES[*]}"
    return 1
  fi

  return 0
}

# ------------------------------------------------------------------------------
# Main
# ------------------------------------------------------------------------------

main() {
  log_info "========== PREPARE.SH =========="
  log_info "Iniciando preparação do ambiente..."

  validate_env
  parse_services
  preview_services

  if start_services; then
    log_info "========== SUCESSO =========="
    log_info "Todos os serviços estão no ar"
    exit 0
  else
    log_error "========== FALHA =========="
    log_error "Alguns serviços falharam ao iniciar"
    exit 1
  fi
}

main "$@"

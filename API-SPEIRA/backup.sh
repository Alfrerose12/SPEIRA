#!/bin/bash

set -a
source /ruta/al/.env
set +a

LOG_FILE="/backups/backup.log"
BACKUP_DIR="/backups"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

log "Iniciando servicio de backups MongoDB"

# Verificación de variables requeridas
if [[ -z "$MONGO_USER" || -z "$MONGO_PASS" || -z "$MONGO_AUTH_DB" ]]; then
    log "ERROR: Faltan variables de entorno de MongoDB (MONGO_USER, MONGO_PASS o MONGO_AUTH_DB)"
    exit 1
fi

while true; do
    TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
    BACKUP_PATH="$BACKUP_DIR/backup_$TIMESTAMP"
    
    log "Comenzando backup: $BACKUP_PATH"
    
    if mongodump \
        --host=mongo \
        --port=27017 \
        --db=speiraDB \
        --username="$MONGO_USER" \
        --password="$MONGO_PASS" \
        --authenticationDatabase="$MONGO_AUTH_DB" \
        --out="$BACKUP_PATH" 2>> "$LOG_FILE";
    then
        log "Backup exitoso: $BACKUP_PATH"
        
        if tar -czf "$BACKUP_PATH.tar.gz" "$BACKUP_PATH" 2>> "$LOG_FILE"; then
            log "Compresión exitosa: $BACKUP_PATH.tar.gz"
            rm -rf "$BACKUP_PATH"
        else
            log "Error al comprimir: $BACKUP_PATH"
        fi
    else
        log "ERROR en el backup: $BACKUP_PATH"
    fi

    log "Eliminando backups antiguos..."
    find "$BACKUP_DIR" -name "backup_*" \( -type d -o -name "*.tar.gz" \) -mtime +7 -exec rm -rf {} \; 2>> "$LOG_FILE"

    log "Esperando 1 hora para el próximo backup..."
    sleep 3600
done
